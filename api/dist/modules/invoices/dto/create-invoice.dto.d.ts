export declare class CreateInvoiceItemDto {
    productId?: number;
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    taxRate?: number;
    discountRate?: number;
}
export declare class CreateInvoiceDto {
    invoiceNumber?: string;
    title: string;
    description?: string;
    status?: string;
    discountAmount?: number;
    currency?: string;
    dueDate?: string;
    notes?: string;
    terms?: string;
    companyId?: number;
    leadId?: number;
    dealId?: number;
    contactId?: number;
    createdBy?: number;
    items: CreateInvoiceItemDto[];
}
