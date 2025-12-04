import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertInvoiceItemDto {
  @IsOptional() @IsNumber() productId?: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsNumber() discountRate?: number;
}
