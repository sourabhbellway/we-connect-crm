import { IsOptional, IsString } from 'class-validator';

export class UpsertIndustryDto {
  @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
}
