import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertIndustryFieldDto {
  @IsString() name: string;
  @IsOptional() @IsString() key?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
