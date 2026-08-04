import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RequestCodeDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  nom?: string;
}
