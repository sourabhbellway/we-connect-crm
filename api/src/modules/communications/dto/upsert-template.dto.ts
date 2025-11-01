import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertTemplateDto {
  @IsString() name: string;
  @IsString() type: string;
  @IsOptional() @IsString() subject?: string;
  @IsString() content: string;
  @IsOptional() variables?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsNumber() createdBy?: number;
}
