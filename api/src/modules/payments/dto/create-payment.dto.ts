import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    @IsDateString()
    @IsOptional()
    paymentDate?: string;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsNumber()
    @IsNotEmpty()
    invoiceId: number;

    @IsNumber()
    @IsOptional()
    createdBy?: number;

    // Extra fields sent by frontend but maybe not stored directly on payment if no relation exists
    @IsNumber()
    @IsOptional()
    leadId?: number;

    @IsNumber()
    @IsOptional()
    dealId?: number;
}
