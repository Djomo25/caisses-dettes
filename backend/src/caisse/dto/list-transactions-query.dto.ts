import { IsOptional, Matches } from 'class-validator';

export class ListTransactionsQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date doit être au format YYYY-MM-DD',
  })
  date?: string;
}
