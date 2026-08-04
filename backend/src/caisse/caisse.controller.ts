import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CaisseService } from './caisse.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { SoldeQueryDto } from './dto/solde-query.dto';

@Controller('caisse')
@UseGuards(JwtAuthGuard)
export class CaisseController {
  constructor(private readonly caisseService: CaisseService) {}

  @Post('transactions')
  createTransaction(
    @CurrentUser('commercantId') commercantId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.caisseService.createTransaction(commercantId, dto);
  }

  @Get('transactions')
  listTransactions(
    @CurrentUser('commercantId') commercantId: string,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.caisseService.listTransactions(commercantId, query.date);
  }

  @Get('solde')
  getSolde(
    @CurrentUser('commercantId') commercantId: string,
    @Query() query: SoldeQueryDto,
  ) {
    return this.caisseService.getSolde(commercantId, query.periode);
  }
}
