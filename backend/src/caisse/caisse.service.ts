import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  APP_TIMEZONE,
  getDayRangeForDateString,
  getDayRangeInTimezone,
} from '../common/timezone';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const LAST_TRANSACTIONS_LIMIT = 50;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class CaisseService {
  constructor(private readonly prisma: PrismaService) {}

  createTransaction(commercantId: string, dto: CreateTransactionDto) {
    return this.prisma.transactionCaisse.create({
      data: {
        commercantId,
        type: dto.type,
        montant: dto.montant,
        libelle: dto.libelle,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  listTransactions(commercantId: string, date?: string) {
    if (date) {
      const { start, end } = getDayRangeForDateString(APP_TIMEZONE, date);
      return this.prisma.transactionCaisse.findMany({
        where: {
          commercantId,
          date: { gte: start, lt: end },
        },
        orderBy: { date: 'desc' },
      });
    }

    return this.prisma.transactionCaisse.findMany({
      where: { commercantId },
      orderBy: { date: 'desc' },
      take: LAST_TRANSACTIONS_LIMIT,
    });
  }

  async getSolde(
    commercantId: string,
    periode: 'jour' | 'semaine' = 'jour',
    reference: Date = new Date(),
  ) {
    const { start, end } = this.periodeRange(periode, reference);

    const [entreesResult, sortiesResult] = await Promise.all([
      this.prisma.transactionCaisse.aggregate({
        where: {
          commercantId,
          type: 'entree',
          date: { gte: start, lt: end },
        },
        _sum: { montant: true },
      }),
      this.prisma.transactionCaisse.aggregate({
        where: {
          commercantId,
          type: 'sortie',
          date: { gte: start, lt: end },
        },
        _sum: { montant: true },
      }),
    ]);

    const entrees = entreesResult._sum.montant ?? 0;
    const sorties = sortiesResult._sum.montant ?? 0;

    return { entrees, sorties, solde: entrees - sorties };
  }

  /**
   * Identifiants des commerçants ayant au moins une transaction datée du
   * jour calendaire courant (fuseau APP_TIMEZONE). Utilisé par le récap
   * quotidien (cron).
   */
  async findCommercantIdsAvecTransactionsAujourdhui(
    reference: Date = new Date(),
  ): Promise<string[]> {
    const { start, end } = getDayRangeInTimezone(APP_TIMEZONE, reference);

    const rows = await this.prisma.transactionCaisse.findMany({
      where: { date: { gte: start, lt: end } },
      distinct: ['commercantId'],
      select: { commercantId: true },
    });

    return rows.map((row) => row.commercantId);
  }

  private periodeRange(
    periode: 'jour' | 'semaine',
    reference: Date,
  ): { start: Date; end: Date } {
    const { start: todayStart, end } = getDayRangeInTimezone(
      APP_TIMEZONE,
      reference,
    );
    const days = periode === 'semaine' ? 7 : 1;
    const start = new Date(todayStart.getTime() - (days - 1) * MS_PER_DAY);

    return { start, end };
  }
}
