import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertIntegrationDto {
  @IsString() name: string;
  @IsString() displayName: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsString() apiEndpoint: string;
  @IsOptional() @IsString() authType?: string;
  @IsOptional() @IsObject() config?: Record<string, unknown>;
}
