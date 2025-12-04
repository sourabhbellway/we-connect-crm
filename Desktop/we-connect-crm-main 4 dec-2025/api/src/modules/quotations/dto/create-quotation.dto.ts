import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuotationItemDto {
  @IsOptional() @IsNumber() productId?: number;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() unit?: string;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsNumber() discountRate?: number;
}

export class CreateQuotationDto {
  @IsOptional() @IsString() quotationNumber?: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() discountAmount?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() terms?: string;
  @IsOptional() @IsNumber() companyId?: number;
  @IsOptional() @IsNumber() leadId?: number;
  @IsOptional() @IsNumber() dealId?: number;
  @IsOptional() @IsNumber() contactId?: number;
  @IsOptional() @IsNumber() createdBy?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
