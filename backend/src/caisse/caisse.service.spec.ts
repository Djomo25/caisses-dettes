import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CaisseService } from './caisse.service';

interface TransactionFixture {
  type: 'entree' | 'sortie';
  montant: number;
}

describe('CaisseService', () => {
  let service: CaisseService;
  let aggregate: jest.Mock;

  const setupTransactions = (transactions: TransactionFixture[]) => {
    aggregate.mockImplementation(
      ({ where }: { where: { type: 'entree' | 'sortie' } }) => {
        const sum = transactions
          .filter((t) => t.type === where.type)
          .reduce((acc, t) => acc + t.montant, 0);
        return Promise.resolve({ _sum: { montant: sum || null } });
      },
    );
  };

  beforeEach(async () => {
    aggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaisseService,
        {
          provide: PrismaService,
          useValue: {
            transactionCaisse: { aggregate },
          },
        },
      ],
    }).compile();

    service = module.get(CaisseService);
  });

  describe('getSolde', () => {
    it('calcule entrees, sorties et solde sur un jeu de transactions connu', async () => {
      setupTransactions([
        { type: 'entree', montant: 10000 },
        { type: 'entree', montant: 15000 },
        { type: 'entree', montant: 5000 },
        { type: 'sortie', montant: 8000 },
        { type: 'sortie', montant: 2000 },
      ]);

      const result = await service.getSolde('commercant-1');

      expect(result).toEqual({ entrees: 30000, sorties: 10000, solde: 20000 });
    });

    it("retourne un solde nul sans erreur en l'absence de transaction", async () => {
      setupTransactions([]);

      const result = await service.getSolde('commercant-1');

      expect(result).toEqual({ entrees: 0, sorties: 0, solde: 0 });
    });
  });
});
