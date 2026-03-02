import { IsBoolean, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'SKU must be a string' })
  sku?: string;

  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  type?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Cost must be a valid number' })
  cost?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;

  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tax rate must be a valid number' })
  taxRate?: number;

  @IsOptional()
  @IsString({ message: 'HSN code must be a string' })
  hsnCode?: string;

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

  @IsOptional()
  @IsString({ message: 'Image path must be a string' })
  image?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
