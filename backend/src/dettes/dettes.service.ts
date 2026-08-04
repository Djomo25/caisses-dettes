import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { APP_TIMEZONE, getDayRangeInTimezone } from '../common/timezone';
import { CreateDetteDto } from './dto/create-dette.dto';

@Injectable()
export class DettesService {
  constructor(private readonly prisma: PrismaService) {}

  createDette(commercantId: string, dto: CreateDetteDto) {
    return this.prisma.detteClient.create({
      data: {
        commercantId,
        nomClient: dto.nomClient,
        montant: dto.montant,
        dateEcheance: dto.dateEcheance ? new Date(dto.dateEcheance) : undefined,
      },
    });
  }

  listDettes(commercantId: string, statut?: 'due' | 'payee') {
    return this.prisma.detteClient.findMany({
      where: {
        commercantId,
        ...(statut ? { statut } : {}),
      },
      orderBy: { dateEcheance: { sort: 'asc', nulls: 'last' } },
    });
  }

  /**
   * Dettes non payées dont l'échéance tombe le jour calendaire courant
   * (fuseau APP_TIMEZONE), tous commerçants confondus. Utilisé par le
   * rappel quotidien (cron).
   */
  findDettesEcheanceAujourdhui(reference: Date = new Date()) {
    const { start, end } = getDayRangeInTimezone(APP_TIMEZONE, reference);

    return this.prisma.detteClient.findMany({
      where: {
        statut: 'due',
        dateEcheance: { gte: start, lt: end },
      },
      orderBy: { commercantId: 'asc' },
    });
  }

  async payerDette(commercantId: string, detteId: string) {
    const dette = await this.prisma.detteClient.findUnique({
      where: { id: detteId },
    });

    if (!dette) {
      throw new NotFoundException('Dette introuvable.');
    }

    if (dette.commercantId !== commercantId) {
      throw new ForbiddenException('Cette dette ne vous appartient pas.');
    }

    return this.prisma.detteClient.update({
      where: { id: detteId },
      data: { statut: 'payee', paidAt: new Date() },
    });
  }
}
