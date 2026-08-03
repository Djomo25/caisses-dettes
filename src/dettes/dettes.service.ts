import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
