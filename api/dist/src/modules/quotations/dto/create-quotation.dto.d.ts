export declare class CreateQuotationItemDto {
    productId?: number;
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    taxRate?: number;
    discountRate?: number;
}
export declare class CreateQuotationDto {
    quotationNumber?: string;
    title: string;
    description?: string;
    status?: string;
    discountAmount?: number;
    currency?: string;
    validUntil?: string;
    notes?: string;
    terms?: string;
    companyId?: number;
    leadId?: number;
    dealId?: number;
    contactId?: number;
    createdBy?: number;
    items: CreateQuotationItemDto[];
}
