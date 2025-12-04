import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordPaymentDto {
  @IsNumber() amount: number;
  @IsOptional() @IsString() currency?: string;
  @IsString() paymentMethod: string;
  @IsOptional() @IsDateString() paymentDate?: string;
  @IsOptional() @IsString() referenceNumber?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() createdBy?: number;
}
