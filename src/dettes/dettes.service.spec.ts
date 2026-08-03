import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DettesService } from './dettes.service';

interface DetteFixture {
  id: string;
  commercantId: string;
  dateEcheance: Date | null;
  statut: 'due' | 'payee';
}

interface DetteWhere {
  statut?: 'due' | 'payee';
  dateEcheance?: { gte?: Date; lt?: Date };
}

/**
 * Reproduit le filtrage `where` de Prisma sur un jeu de dettes en mémoire,
 * pour verifier que le service construit les bonnes bornes de date sans
 * dépendre d'une vraie base.
 */
function simulateFindMany(dettes: DetteFixture[], where: DetteWhere) {
  return dettes.filter((dette) => {
    if (where.statut && dette.statut !== where.statut) {
      return false;
    }
    if (where.dateEcheance) {
      const { gte, lt } = where.dateEcheance;
      if (!dette.dateEcheance) {
        return false;
      }
      if (gte && dette.dateEcheance < gte) {
        return false;
      }
      if (lt && dette.dateEcheance >= lt) {
        return false;
      }
    }
    return true;
  });
}

describe('DettesService', () => {
  let service: DettesService;
  let findMany: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DettesService,
        {
          provide: PrismaService,
          useValue: {
            detteClient: { findMany },
          },
        },
      ],
    }).compile();

    service = module.get(DettesService);
  });

  describe('findDettesEcheanceAujourdhui', () => {
    // Référence prise en pleine journée (Kinshasa, UTC+1) du 2026-08-04,
    // pour ne pas se retrouver près d'une frontière de jour.
    const reference = new Date('2026-08-04T12:00:00.000Z');

    const hier = new Date('2026-08-03T00:00:00.000Z');
    const aujourdhui = new Date('2026-08-04T00:00:00.000Z');
    const demain = new Date('2026-08-05T00:00:00.000Z');

    const dettes: DetteFixture[] = [
      { id: 'hier', commercantId: 'c1', dateEcheance: hier, statut: 'due' },
      {
        id: 'aujourdhui-due',
        commercantId: 'c1',
        dateEcheance: aujourdhui,
        statut: 'due',
      },
      {
        id: 'demain',
        commercantId: 'c1',
        dateEcheance: demain,
        statut: 'due',
      },
      {
        id: 'aujourdhui-payee',
        commercantId: 'c1',
        dateEcheance: aujourdhui,
        statut: 'payee',
      },
    ];

    beforeEach(() => {
      findMany.mockImplementation(({ where }: { where: DetteWhere }) =>
        Promise.resolve(simulateFindMany(dettes, where)),
      );
    });

    it("ne retourne que la dette due dont l'échéance est aujourd'hui", async () => {
      const result = await service.findDettesEcheanceAujourdhui(reference);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('aujourdhui-due');
    });

    it("exclut la dette déjà payée même si son échéance est aujourd'hui", async () => {
      const result = await service.findDettesEcheanceAujourdhui(reference);

      expect(result.some((d) => d.id === 'aujourdhui-payee')).toBe(false);
    });

    it("exclut les dettes dont l'échéance est hier ou demain", async () => {
      const result = await service.findDettesEcheanceAujourdhui(reference);

      expect(result.some((d) => d.id === 'hier')).toBe(false);
      expect(result.some((d) => d.id === 'demain')).toBe(false);
    });
  });
});
