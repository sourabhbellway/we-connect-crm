export declare class CreatePaymentDto {
    amount: number;
    currency?: string;
    paymentMethod: string;
    paymentDate?: string;
    reference?: string;
    notes?: string;
    invoiceId: number;
    createdBy?: number;
    leadId?: number;
    dealId?: number;
}
