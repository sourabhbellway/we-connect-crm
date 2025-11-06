import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpsertIndustryDto {
  @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
