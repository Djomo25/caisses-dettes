import { IsIn, IsOptional } from 'class-validator';

export class ListDettesQueryDto {
  @IsOptional()
  @IsIn(['due', 'payee'])
  statut?: 'due' | 'payee';
}
