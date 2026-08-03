import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DettesController } from './dettes.controller';
import { DettesService } from './dettes.service';

@Module({
  imports: [AuthModule],
  controllers: [DettesController],
  providers: [DettesService],
})
export class DettesModule {}
