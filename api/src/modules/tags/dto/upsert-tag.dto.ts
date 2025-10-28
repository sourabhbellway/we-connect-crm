import { IsOptional, IsString } from 'class-validator';

export class UpsertTagDto {
  @IsString() name: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() description?: string;
}
