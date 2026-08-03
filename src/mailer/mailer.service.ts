import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>(
      'SMTP_FROM',
      'no-reply@caisse-dettes.local',
    );
    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendCodeConnexion(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Votre code de connexion',
      text: `Votre code est ${code}, valable 10 minutes.`,
    });
    this.logger.log(`Code de connexion envoyé à ${email}`);
  }
}
