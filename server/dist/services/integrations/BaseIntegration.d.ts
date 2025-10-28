import { PrismaClient } from '@prisma/client';
export interface IntegrationConfig {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    webhookUrl?: string;
    [key: string]: any;
}
export interface LeadData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    notes?: string;
    source: string;
    externalId: string;
    budget?: number;
    industry?: string;
    website?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    [key: string]: any;
}
export interface IntegrationResponse {
    success: boolean;
    data?: LeadData[];
    message?: string;
    error?: string;
    totalCount?: number;
    hasMore?: boolean;
    nextPageToken?: string;
}
export declare abstract class BaseIntegration {
    protected prisma: PrismaClient;
    protected config: IntegrationConfig;
    protected integrationId: number;
    constructor(prisma: PrismaClient, config: IntegrationConfig, integrationId: number);
    abstract getName(): string;
    abstract fetchLeads(lastSyncDate?: Date, pageToken?: string): Promise<IntegrationResponse>;
    abstract validateConfig(): Promise<boolean>;
    abstract testConnection(): Promise<boolean>;
    protected logOperation(operation: string, status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'PARTIAL', message?: string, data?: any, errorDetails?: string, recordsCount?: number): Promise<void>;
    protected syncLead(leadData: LeadData): Promise<{
        success: boolean;
        leadId?: number;
        error?: string;
    }>;
    protected sanitizeLeadData(data: any): LeadData;
}
//# sourceMappingURL=BaseIntegration.d.ts.map