import { PrismaService } from '../../database/prisma.service';
export declare class BusinessSettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ensureSettings(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
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
    }>;
    getCompany(): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            website: string | null;
            logo: string | null;
        };
    }>;
    updateCompany(body: any): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
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
        };
    }>;
    uploadLogo(file: any): Promise<{
        success: boolean;
        data: {
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
            currency: string;
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
        };
    }>;
    getTax(): Promise<{
        success: boolean;
        data: {
            defaultRate: number;
        };
    }>;
    updateTax(body: any): Promise<{
        success: boolean;
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
