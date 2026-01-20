import { InvoiceTemplatesService } from './invoice-templates.service';
export declare class InvoiceTemplatesController {
    private readonly invoiceTemplatesService;
    constructor(invoiceTemplatesService: InvoiceTemplatesService);
    findAll(): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            id: number;
            name: string;
            description: string | null;
            designType: string;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            primaryColor: string | null;
            secondaryColor: string | null;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            id: number;
            name: string;
            description: string | null;
            designType: string;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            primaryColor: string | null;
            secondaryColor: string | null;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    }>;
    create(data: any): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            id: number;
            name: string;
            description: string | null;
            designType: string;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            primaryColor: string | null;
            secondaryColor: string | null;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    update(id: string, data: any): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            id: number;
            name: string;
            description: string | null;
            designType: string;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            primaryColor: string | null;
            secondaryColor: string | null;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    setDefault(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
