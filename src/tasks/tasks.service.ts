import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CaisseService } from '../caisse/caisse.service';
import { DettesService } from '../dettes/dettes.service';
import { APP_TIMEZONE } from '../common/timezone';
import { DetteClient } from '@prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly caisseService: CaisseService,
    private readonly dettesService: DettesService,
  ) {}

  @Cron('0 8 * * *', {
    name: 'rappel-dettes-echeance',
    timeZone: APP_TIMEZONE,
  })
  async rappelDettesEcheance(): Promise<void> {
    const dettes = await this.dettesService.findDettesEcheanceAujourdhui();
    if (dettes.length === 0) {
      return;
    }

    const dettesParCommercant = this.grouperParCommercant(dettes);
    const commercants = await this.prisma.commercant.findMany({
      where: { id: { in: [...dettesParCommercant.keys()] } },
    });

    for (const commercant of commercants) {
      const dettesDuJour = dettesParCommercant.get(commercant.id) ?? [];
      const corps = dettesDuJour
        .map((dette) => `- ${dette.nomClient} : ${dette.montant}`)
        .join('\n');

      await this.mailer.envoyerEmail(
        commercant.email,
        "Dettes arrivant à échéance aujourd'hui",
        `Les dettes suivantes arrivent à échéance aujourd'hui :\n\n${corps}`,
      );
    }

    this.logger.log(
      `Rappel de dettes envoyé à ${commercants.length} commerçant(s)`,
    );
  }

  @Cron('0 19 * * *', {
    name: 'recap-quotidien',
    timeZone: APP_TIMEZONE,
  })
  async recapQuotidien(): Promise<void> {
    const commercantIds =
      await this.caisseService.findCommercantIdsAvecTransactionsAujourdhui();
    if (commercantIds.length === 0) {
      return;
    }

    const commercants = await this.prisma.commercant.findMany({
      where: { id: { in: commercantIds } },
    });

    for (const commercant of commercants) {
      const { entrees, sorties, solde } = await this.caisseService.getSolde(
        commercant.id,
        'jour',
      );

      const corps = [
        `Entrées : ${entrees}`,
        `Sorties : ${sorties}`,
        `Solde net : ${solde}`,
      ].join('\n');

      await this.mailer.envoyerEmail(
        commercant.email,
        'Votre récap du jour',
        corps,
      );
    }

    this.logger.log(
      `Récap quotidien envoyé à ${commercants.length} commerçant(s)`,
    );
  }

  private grouperParCommercant(
    dettes: DetteClient[],
  ): Map<string, DetteClient[]> {
    const groupes = new Map<string, DetteClient[]>();
    for (const dette of dettes) {
      const liste = groupes.get(dette.commercantId) ?? [];
      liste.push(dette);
      groupes.set(dette.commercantId, liste);
    }
    return groupes;
  }
}
