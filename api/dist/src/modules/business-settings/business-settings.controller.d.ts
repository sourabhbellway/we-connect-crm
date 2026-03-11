import { BusinessSettingsService } from './business-settings.service';
export declare class BusinessSettingsController {
    private readonly service;
    constructor(service: BusinessSettingsService);
    getCompany(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: any;
            email: any;
            phone: any;
            address: any;
            website: any;
            logo: any;
            timezone: any;
            fiscalYearStart: any;
            gstNumber: any;
            panNumber: any;
            cinNumber: any;
            industry: any;
            employeeCount: any;
            description: any;
            invoiceTemplate: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    updateCompany(body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: any;
            email: any;
            phone: any;
            address: any;
            website: any;
            logo: any;
            timezone: any;
            fiscalYearStart: any;
            gstNumber: any;
            panNumber: any;
            cinNumber: any;
            industry: any;
            employeeCount: any;
            description: any;
            invoiceTemplate: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    uploadLogo(file: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: any;
            email: any;
            phone: any;
            address: any;
            website: any;
            logo: any;
            timezone: any;
            fiscalYearStart: any;
            gstNumber: any;
            panNumber: any;
            cinNumber: any;
            industry: any;
            employeeCount: any;
            description: any;
            invoiceTemplate: any;
            createdAt: any;
            updatedAt: any;
            logoUrl: string;
        };
    }>;
    getCurrency(): Promise<{
        success: boolean;
        data: {
            currency: string;
        };
    }>;
    updateCurrency(body: any): Promise<{
        success: boolean;
        data: {
            industry: string | null;
            currency: string;
            invoiceTemplate: string;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            companyName: string;
            companyEmail: string | null;
            companyPhone: string | null;
            companyAddress: string | null;
            companyWebsite: string | null;
            companyLogo: string | null;
            timeZone: string;
            dateFormat: string;
            passwordMinLength: number;
            passwordRequireUpper: boolean;
            passwordRequireLower: boolean;
            passwordRequireNumber: boolean;
            passwordRequireSymbol: boolean;
            sessionTimeout: number;
            maxLoginAttempts: number;
            accountLockDuration: number;
            twoFactorRequired: boolean;
            emailVerificationRequired: boolean;
            leadAutoAssignmentEnabled: boolean;
            leadFollowUpReminderDays: number;
            metaAdsApiKey: string | null;
            metaAdsApiSecret: string | null;
            metaAdsEnabled: boolean;
            indiamartApiKey: string | null;
            indiamartApiSecret: string | null;
            indiamartEnabled: boolean;
            tradindiaApiKey: string | null;
            tradindiaApiSecret: string | null;
            tradindiaEnabled: boolean;
            gstNumber: string | null;
            panNumber: string | null;
            cinNumber: string | null;
            fiscalYearStart: string | null;
            employeeCount: string | null;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
            quotePrefix: string;
            quoteSuffix: string;
            quotePad: number;
            invoicePrefix: string;
            invoiceSuffix: string;
            invoicePad: number;
            quoteNumberingEnabled: boolean;
            invoiceNumberingEnabled: boolean;
        };
    }>;
    getTax(): Promise<{
        success: boolean;
        data: {
            defaultRate: number;
            type: string;
            inclusive: boolean;
        };
    }>;
    updateTax(body: any): Promise<{
        success: boolean;
    }>;
    getAll(): Promise<{
        success: boolean;
        data: {
            company: {
                id: string;
                name: any;
                email: any;
                phone: any;
                address: any;
                website: any;
                logo: any;
                timezone: any;
                fiscalYearStart: any;
                gstNumber: any;
                panNumber: any;
                cinNumber: any;
                industry: any;
                employeeCount: any;
                description: any;
                invoiceTemplate: any;
                createdAt: any;
                updatedAt: any;
            };
            currency: any;
            tax: any;
            leadSources: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                companyId: number | null;
                color: string;
                sortOrder: number;
            }[];
            leadStatuses: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                color: string;
                sortOrder: number;
            }[];
            leadStatusOptions: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            dealStatuses: {
                description: string | null;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                color: string;
                sortOrder: number;
            }[];
            numbering: {
                defaultTerms: any;
                paymentTerms: any;
                shippingTerms: any;
            };
        };
    }>;
    getNumbering(): Promise<{
        success: boolean;
        data: {
            quotePrefix: string;
            quoteSuffix: string;
            quotePad: number;
            invoicePrefix: string;
            invoiceSuffix: string;
            invoicePad: number;
            quoteNumberingEnabled: boolean;
            invoiceNumberingEnabled: boolean;
        };
    }>;
    updateNumbering(body: any): Promise<{
        success: boolean;
        data: {
            quotePrefix: string;
            quoteSuffix: string;
            quotePad: number;
            invoicePrefix: string;
            invoiceSuffix: string;
            invoicePad: number;
            quoteNumberingEnabled: boolean;
            invoiceNumberingEnabled: boolean;
        };
    }>;
    listDealStatuses(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        }[];
    }>;
    createDealStatus(body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        };
    }>;
    updateDealStatus(id: string, body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        };
    }>;
    deleteDealStatus(id: string): Promise<{
        success: boolean;
    }>;
    listLeadStatuses(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        }[];
    }>;
    createLeadStatus(body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        };
    }>;
    updateLeadStatus(id: string, body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            color: string;
            sortOrder: number;
        };
    }>;
    deleteLeadStatus(id: string): Promise<{
        success: boolean;
    }>;
    getAvailableIntegrations(): Promise<{
        success: boolean;
        data: {
            integrations: {
                name: string;
                displayName: string;
                description: string;
                fields: {
                    name: string;
                    label: string;
                    type: string;
                    required: boolean;
                }[];
                instructions: string;
            }[];
        };
    }>;
    getIntegrationsStatus(): Promise<{
        success: boolean;
        data: {
            integrations: Record<string, any>;
        };
    }>;
    getSettings(): Promise<{
        success: boolean;
        data: {
            settings: any;
        };
    }>;
    updateSettings(body: any): Promise<{
        success: boolean;
        data: any;
    }>;
    testIntegration(name: string): Promise<{
        success: boolean;
        data: {
            success: boolean;
            message: string;
        };
    }>;
    syncIntegration(name: string): Promise<{
        success: boolean;
        data: {
            synced: number;
            message: string;
        };
    }>;
    listLeadSources(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    createLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
    }>;
    updateLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            color: string;
            sortOrder: number;
        };
    }>;
    listQuotationTemplates(): Promise<{
        success: boolean;
        data: {
            termsAndConditions: string | null;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            headerContent: string | null;
            footerContent: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        }[];
    }>;
    createQuotationTemplate(body: any): Promise<{
        success: boolean;
        data: {
            termsAndConditions: string | null;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            headerContent: string | null;
            footerContent: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    updateQuotationTemplate(id: string, body: any): Promise<{
        success: boolean;
        data: {
            termsAndConditions: string | null;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            headerContent: string | null;
            footerContent: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    deleteQuotationTemplate(id: string): Promise<{
        success: boolean;
    }>;
    setDefaultQuotationTemplate(id: string): Promise<{
        success: boolean;
        data: {
            termsAndConditions: string | null;
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            headerContent: string | null;
            footerContent: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    listTermsAndConditions(): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            content: string;
            isDefault: boolean;
            category: string | null;
        }[];
    }>;
    createTermsAndConditions(body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            content: string;
            isDefault: boolean;
            category: string | null;
        };
    }>;
    updateTermsAndConditions(id: string, body: any): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            content: string;
            isDefault: boolean;
            category: string | null;
        };
    }>;
    deleteTermsAndConditions(id: string): Promise<{
        success: boolean;
    }>;
    setDefaultTermsAndConditions(id: string): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            content: string;
            isDefault: boolean;
            category: string | null;
        };
    }>;
    getWelcomeEmailTemplate(): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    } | {
        success: boolean;
        data: {
            id: null;
            name: string;
            category: string;
            subject: string;
            htmlContent: string;
            textContent: string;
            variables: string[];
        };
    }>;
    updateWelcomeEmailTemplate(body: any): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    getEmailTemplatesByCategory(category: string): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        }[];
    }>;
    getSystemEmailTemplate(category: string): Promise<{
        success: boolean;
        data: {
            id: null;
            name: any;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            subject: any;
            htmlContent: any;
            textContent: any;
            variables: any;
        };
    } | {
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    previewEmailTemplate(id: string, query: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: number;
            name: string;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            type: import(".prisma/client").$Enums.TemplateType;
            subject: string;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue;
            sampleData: {
                firstName: string;
                lastName: string;
                email: string;
                password: string;
                appName: string;
                verificationLink: string;
                resetLink: string;
            };
        };
        message?: undefined;
    }>;
    getEmailTemplates(): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        }[];
    }>;
    createEmailTemplate(body: any): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    setDefaultEmailTemplate(id: string, body: any): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    updateEmailTemplate(id: string, body: any): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    deleteEmailTemplate(id: string): Promise<{
        success: boolean;
        data: {
            type: import(".prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            companyId: number | null;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            isDefault: boolean;
            category: import(".prisma/client").$Enums.EmailTemplateCategory;
            htmlContent: string;
            textContent: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    getFieldConfigs(entityType: string): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            entityType: string;
            fieldName: string;
            label: string;
            isRequired: boolean;
            isVisible: boolean;
            displayOrder: number;
            section: string | null;
            placeholder: string | null;
            helpText: string | null;
            validation: import("@prisma/client/runtime/library").JsonValue | null;
            options: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    createFieldConfig(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            entityType: string;
            fieldName: string;
            label: string;
            isRequired: boolean;
            isVisible: boolean;
            displayOrder: number;
            section: string | null;
            placeholder: string | null;
            helpText: string | null;
            validation: import("@prisma/client/runtime/library").JsonValue | null;
            options: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    updateFieldConfig(id: string, body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            entityType: string;
            fieldName: string;
            label: string;
            isRequired: boolean;
            isVisible: boolean;
            displayOrder: number;
            section: string | null;
            placeholder: string | null;
            helpText: string | null;
            validation: import("@prisma/client/runtime/library").JsonValue | null;
            options: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    deleteFieldConfig(id: string): Promise<{
        success: boolean;
    }>;
    initializeDefaultFieldConfigs(): Promise<{
        success: boolean;
        message: string;
    }>;
    getDashboardSettings(): Promise<{
        success: boolean;
        data: any;
    }>;
    updateDashboardSettings(body: any): Promise<{
        success: boolean;
        data: any;
    }>;
    listLeadSections(): Promise<{
        success: boolean;
        data: {
            icon: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            key: string;
            color: string;
            sortOrder: number;
            label: string;
        }[];
    }>;
    createLeadSection(body: any): Promise<{
        success: boolean;
        data: {
            icon: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            key: string;
            color: string;
            sortOrder: number;
            label: string;
        };
    }>;
    updateLeadSection(id: string, body: any): Promise<{
        success: boolean;
        data: {
            icon: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            key: string;
            color: string;
            sortOrder: number;
            label: string;
        };
    }>;
    deleteLeadSection(id: string): Promise<{
        success: boolean;
    }>;
}
