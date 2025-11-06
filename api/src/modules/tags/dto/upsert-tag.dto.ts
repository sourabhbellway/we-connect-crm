import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpsertTagDto {
  @IsString() name: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
