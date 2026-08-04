import { IsIn, IsOptional } from 'class-validator';

export class SoldeQueryDto {
  @IsOptional()
  @IsIn(['jour', 'semaine'])
  periode?: 'jour' | 'semaine' = 'jour';
}
