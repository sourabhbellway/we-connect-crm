import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertProposalTemplateDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() content: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsString() headerHtml?: string;
  @IsOptional() @IsString() footerHtml?: string;
  @IsOptional() styles?: Record<string, unknown>;
  @IsOptional() variables?: Record<string, unknown>;
  @IsOptional() @IsString() previewImage?: string;
  @IsOptional() @IsString() category?: string;
}
