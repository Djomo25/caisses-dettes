import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DettesService } from './dettes.service';
import { CreateDetteDto } from './dto/create-dette.dto';
import { ListDettesQueryDto } from './dto/list-dettes-query.dto';

@Controller('dettes')
@UseGuards(JwtAuthGuard)
export class DettesController {
  constructor(private readonly dettesService: DettesService) {}

  @Post()
  createDette(
    @CurrentUser('commercantId') commercantId: string,
    @Body() dto: CreateDetteDto,
  ) {
    return this.dettesService.createDette(commercantId, dto);
  }

  @Get()
  listDettes(
    @CurrentUser('commercantId') commercantId: string,
    @Query() query: ListDettesQueryDto,
  ) {
    return this.dettesService.listDettes(commercantId, query.statut);
  }

  @Patch(':id/payer')
  payerDette(
    @CurrentUser('commercantId') commercantId: string,
    @Param('id') id: string,
  ) {
    return this.dettesService.payerDette(commercantId, id);
  }
}
