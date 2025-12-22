import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsNumber() industryId?: number;
}
