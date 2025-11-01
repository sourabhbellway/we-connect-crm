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
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            currency: string;
            employeeCount: string | null;
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
                createdAt: any;
                updatedAt: any;
            };
            currency: any;
            tax: any;
            leadSources: {
                name: string;
                id: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                companyId: number | null;
                description: string | null;
            }[];
            pipelines: never[];
        };
    }>;
    getPipelines(): Promise<{
        success: boolean;
        data: never[];
    }>;
    listLeadSources(): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        }[];
    }>;
    createLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
    updateLeadSource(body: any): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            companyId: number | null;
            description: string | null;
        };
    }>;
}
