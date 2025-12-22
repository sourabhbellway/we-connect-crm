import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateUnitTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}