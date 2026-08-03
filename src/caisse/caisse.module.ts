import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaisseController } from './caisse.controller';
import { CaisseService } from './caisse.service';

@Module({
  imports: [AuthModule],
  controllers: [CaisseController],
  providers: [CaisseService],
})
export class CaisseModule {}
