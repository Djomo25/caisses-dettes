import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Commercant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

const CODE_VALIDITY_MINUTES = 10;
const JWT_VALIDITY = '30d';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly jwt: JwtService,
  ) {}

  async requestCode(dto: RequestCodeDto): Promise<{ success: true }> {
    const commercantExistant = await this.prisma.commercant.findUnique({
      where: { email: dto.email },
    });

    let commercant: Commercant;

    if (dto.nom) {
      if (commercantExistant) {
        throw new ConflictException(
          'Un compte existe déjà avec cet email, connectez-vous plutôt.',
        );
      }
      commercant = await this.prisma.commercant.create({
        data: { email: dto.email, nom: dto.nom },
      });
    } else {
      if (!commercantExistant) {
        throw new NotFoundException(
          "Aucun compte trouvé avec cet email, créez un compte d'abord.",
        );
      }
      commercant = commercantExistant;
    }

    const code = this.generateCode();
    const expireAt = new Date(Date.now() + CODE_VALIDITY_MINUTES * 60 * 1000);

    await this.prisma.codeConnexion.create({
      data: {
        commercantId: commercant.id,
        code,
        expireAt,
      },
    });

    await this.mailer.sendCodeConnexion(commercant.email, code);

    return { success: true };
  }

  async verifyCode(dto: VerifyCodeDto): Promise<{ token: string }> {
    const codeConnexion = await this.prisma.codeConnexion.findFirst({
      where: {
        utilise: false,
        commercant: { email: dto.email },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (
      !codeConnexion ||
      codeConnexion.code !== dto.code ||
      codeConnexion.expireAt < new Date()
    ) {
      throw new UnauthorizedException('Code invalide ou expiré.');
    }

    await this.prisma.codeConnexion.update({
      where: { id: codeConnexion.id },
      data: { utilise: true },
    });

    const token = await this.jwt.signAsync(
      { commercantId: codeConnexion.commercantId },
      { expiresIn: JWT_VALIDITY },
    );

    return { token };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
