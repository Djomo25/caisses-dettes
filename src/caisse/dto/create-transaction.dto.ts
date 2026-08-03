import {
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsIn(['entree', 'sortie'])
  type: 'entree' | 'sortie';

  @IsNumber()
  @IsPositive()
  montant: number;

  @IsOptional()
  @IsString()
  libelle?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;
}
