import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() category?: string;
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  price: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Cost must be a valid number' })
  cost?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tax rate must be a valid number' })
  taxRate?: number;
  @IsOptional() @IsString() hsnCode?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock quantity must be a valid number' })
  stockQuantity?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Min stock level must be a valid number' })
  minStockLevel?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Max stock level must be a valid number' })
  maxStockLevel?: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
