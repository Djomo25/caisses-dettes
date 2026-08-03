import { Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { CaisseModule } from '../caisse/caisse.module';
import { DettesModule } from '../dettes/dettes.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [MailerModule, CaisseModule, DettesModule],
  providers: [TasksService],
})
export class TasksModule {}
