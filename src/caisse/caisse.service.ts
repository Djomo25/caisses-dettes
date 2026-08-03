import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
      const { start, end } = this.dayRange(date);
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

  async getSolde(commercantId: string, periode: 'jour' | 'semaine' = 'jour') {
    const { start, end } = this.periodeRange(periode);

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

  private dayRange(date: string): { start: Date; end: Date } {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start.getTime() + MS_PER_DAY);
    return { start, end };
  }

  private periodeRange(periode: 'jour' | 'semaine'): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const end = new Date(todayStart.getTime() + MS_PER_DAY);
    const days = periode === 'semaine' ? 7 : 1;
    const start = new Date(todayStart.getTime() - (days - 1) * MS_PER_DAY);

    return { start, end };
  }
}
