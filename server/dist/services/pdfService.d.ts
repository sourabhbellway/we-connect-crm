interface QuotationPDFData {
    quotation: {
        quotationNumber: string;
        title: string;
        description?: string;
        createdAt: Date;
        validUntil?: Date;
        currency: string;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        totalAmount: number;
        notes?: string;
        terms?: string;
    };
    company: {
        companyName: string;
        companyEmail?: string;
        companyPhone?: string;
        companyAddress?: string;
        companyWebsite?: string;
        companyLogo?: string;
    };
    customer: {
        fullName: string;
        email: string;
        phone?: string;
        company?: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    items: Array<{
        name: string;
        description?: string;
        quantity: number;
        unit?: string;
        unitPrice: number;
        taxRate: number;
        discountRate: number;
        totalAmount: number;
    }>;
}
export declare class PDFService {
    private getCurrencySymbol;
    private formatCurrency;
    private formatDate;
    generateQuotationPDF(data: QuotationPDFData): Promise<Buffer>;
}
declare const _default: PDFService;
export default _default;
//# sourceMappingURL=pdfService.d.ts.map