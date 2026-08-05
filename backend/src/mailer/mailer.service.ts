import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'no-reply@caisse-dettes.local',
    );
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async envoyerEmail(to: string, sujet: string, corps: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: sujet,
      text: corps,
    });

    if (error) {
      throw new Error(
        `Échec de l'envoi de l'email via Resend : ${error.message}`,
      );
    }

    this.logger.log(`Email "${sujet}" envoyé à ${to}`);
  }

  async sendCodeConnexion(email: string, code: string): Promise<void> {
    await this.envoyerEmail(
      email,
      'Votre code de connexion',
      `Votre code est ${code}, valable 10 minutes.`,
    );
  }
}
