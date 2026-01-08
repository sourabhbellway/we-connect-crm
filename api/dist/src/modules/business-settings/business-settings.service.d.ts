import { PrismaService } from '../../database/prisma.service';
import { CommunicationsService } from '../communications/communications.service';
import { EmailTemplateCategory } from '@prisma/client';
export declare class BusinessSettingsService {
    private readonly prisma;
    private readonly communicationsService;
    constructor(prisma: PrismaService, communicationsService: CommunicationsService);
    private generateUniqueColor;
    private parseExtended;
    private saveExtended;
    ensureSettings(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        invoiceTemplate: string;
        industry: string | null;
        currency: string;
        preferences: import("@prisma/client/runtime/library").JsonValue | null;
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
        invoiceNumberingEnabled: boolean;
        invoicePad: number;
        invoicePrefix: string;
        invoiceSuffix: string;
        quoteNumberingEnabled: boolean;
        quotePad: number;
        quotePrefix: string;
        quoteSuffix: string;
    }>;
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
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            invoiceTemplate: string;
            industry: string | null;
            currency: string;
            preferences: import("@prisma/client/runtime/library").JsonValue | null;
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
            invoiceNumberingEnabled: boolean;
            invoicePad: number;
            invoicePrefix: string;
            invoiceSuffix: string;
            quoteNumberingEnabled: boolean;
            quotePad: number;
            quotePrefix: string;
            quoteSuffix: string;
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
    listLeadSources(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    createLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        };
    }>;
    updateLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        };
    }>;
    getAllBusinessSettings(): Promise<{
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
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                name: string;
                description: string | null;
                color: string;
                sortOrder: number;
            }[];
            leadStatuses: {
                id: number;
                name: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "CLOSED" | "LOST" | "CONVERTED";
                color: string;
                isActive: boolean;
                sortOrder: number;
            }[];
            dealStatuses: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
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
    getIntegrationSettings(): Promise<{
        success: boolean;
        data: {
            settings: any;
        };
    }>;
    updateIntegrationSettings(body: any): Promise<{
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
    listQuotationTemplates(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
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
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    updateQuotationTemplate(id: number, body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    deleteQuotationTemplate(id: number): Promise<{
        success: boolean;
    }>;
    setDefaultQuotationTemplate(id: number): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            headerContent: string | null;
            footerContent: string | null;
            termsAndConditions: string | null;
            showTax: boolean;
            showDiscount: boolean;
            logoPosition: string;
            isDefault: boolean;
            styles: import("@prisma/client/runtime/library").JsonValue | null;
            validityDays: number;
        };
    }>;
    getEmailTemplates(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        }[];
    }>;
    createEmailTemplate(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    updateEmailTemplate(id: number, body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    deleteEmailTemplate(id: number): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    setDefaultEmailTemplate(id: number, category: EmailTemplateCategory): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    getEmailTemplatesByCategory(category: EmailTemplateCategory): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        }[];
    }>;
    getWelcomeEmailTemplate(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
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
    getSystemEmailTemplate(category: EmailTemplateCategory): Promise<{
        success: boolean;
        data: {
            id: null;
            name: any;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            subject: any;
            htmlContent: any;
            textContent: any;
            variables: any;
        };
    } | {
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    upsertWelcomeEmailTemplate(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            deletedAt: Date | null;
            name: string;
            isDefault: boolean;
            type: import("@prisma/client").$Enums.TemplateType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdBy: number;
            status: import("@prisma/client").$Enums.EmailTemplateStatus;
            subject: string;
            variables: import("@prisma/client/runtime/library").JsonValue | null;
            textContent: string;
            htmlContent: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            approvedAt: Date | null;
            approvedBy: number | null;
        };
    }>;
    previewEmailTemplate(id: number, sampleData?: Record<string, string>): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: number;
            name: string;
            category: import("@prisma/client").$Enums.EmailTemplateCategory;
            type: import("@prisma/client").$Enums.TemplateType;
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
    updateFieldConfig(id: number, body: any): Promise<{
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
    deleteFieldConfig(id: number): Promise<{
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
    listTermsAndConditions(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            isDefault: boolean;
            content: string;
            category: string | null;
        }[];
    }>;
    createTermsAndConditions(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            isDefault: boolean;
            content: string;
            category: string | null;
        };
    }>;
    updateTermsAndConditions(id: number, body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            isDefault: boolean;
            content: string;
            category: string | null;
        };
    }>;
    deleteTermsAndConditions(id: number): Promise<{
        success: boolean;
    }>;
    setDefaultTermsAndConditions(id: number): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            isDefault: boolean;
            content: string;
            category: string | null;
        };
    }>;
    listDealStatuses(): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        }[];
    }>;
    createDealStatus(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        };
    }>;
    updateDealStatus(id: number, body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            color: string;
            sortOrder: number;
        };
    }>;
    deleteDealStatus(id: number): Promise<{
        success: boolean;
    }>;
    getVoIPConfig(): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: {
            config: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                provider: string;
                apiKey: string;
                apiSecret: string;
                accountSid: string | null;
                authToken: string | null;
                regions: string[];
                defaultRegion: string | null;
                enableCallRecording: boolean;
                recordingStorage: string | null;
                enableVideoCalls: boolean;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    saveVoIPConfig(dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            config: {
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                provider: string;
                apiKey: string;
                apiSecret: string;
                accountSid: string | null;
                authToken: string | null;
                regions: string[];
                defaultRegion: string | null;
                enableCallRecording: boolean;
                recordingStorage: string | null;
                enableVideoCalls: boolean;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getVoIPCallHistory(query: any): Promise<{
        success: boolean;
        data: {
            calls: ({
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                lead: {
                    id: number;
                    firstName: string | null;
                    lastName: string | null;
                    company: string | null;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
                leadId: number;
                status: string;
                duration: number | null;
                phoneNumber: string;
                callType: string;
                region: string | null;
                callId: string;
                recordingUrl: string | null;
                errorMessage: string | null;
                errorCode: string | null;
                isRecorded: boolean;
                provider: string;
                startTime: Date | null;
                endTime: Date | null;
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getVoIPStatistics(): Promise<{
        success: boolean;
        data: {
            totalCalls: number;
            answeredCalls: number;
            completedCalls: number;
            videoCalls: number;
            audioCalls: number;
            averageCallDuration: number;
            indiaCalls: number;
            arabicCalls: number;
            answerRate: number;
            completionRate: number;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
