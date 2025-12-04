import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() category?: string;
  @IsNumber() price: number;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsNumber() stockQuantity?: number;
  @IsOptional() @IsNumber() minStockLevel?: number;
  @IsOptional() @IsNumber() maxStockLevel?: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
