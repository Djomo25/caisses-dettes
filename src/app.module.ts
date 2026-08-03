import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CaisseModule } from './caisse/caisse.module';
import { DettesModule } from './dettes/dettes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CaisseModule,
    DettesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
