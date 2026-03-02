import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuotationItemDto {
  @IsOptional()
  @IsNumber({}, { message: 'Product ID must be a number' })
  productId?: number;

  @IsString({ message: 'Item name must be a string' })
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  unit?: string;

  @IsNumber({}, { message: 'Unit price must be a valid number' })
  @IsNotEmpty({ message: 'Unit price is required' })
  unitPrice: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tax rate must be a valid number' })
  taxRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Discount rate must be a valid number' })
  discountRate?: number;
}

export class CreateQuotationDto {
  @IsOptional()
  @IsString({ message: 'Quotation number must be a string' })
  quotationNumber?: string;

  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Discount amount must be a number' })
  discountAmount?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  currency?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Valid until must be a valid date string' })
  validUntil?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsString({ message: 'Terms must be a string' })
  terms?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Company ID must be a number' })
  companyId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Lead ID must be a number' })
  leadId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Deal ID must be a number' })
  dealId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Contact ID must be a number' })
  contactId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Creator ID must be a number' })
  createdBy?: number;

  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: 'Items are required' })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
