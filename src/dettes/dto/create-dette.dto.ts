import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateDetteDto {
  @IsNotEmpty()
  nomClient: string;

  @IsNumber()
  @IsPositive()
  montant: number;

  @IsOptional()
  @IsISO8601()
  dateEcheance?: string;
}
