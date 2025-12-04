import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpsertLeadSourceDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
