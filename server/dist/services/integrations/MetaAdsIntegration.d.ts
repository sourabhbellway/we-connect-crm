import { PrismaClient } from '@prisma/client';
import { BaseIntegration, IntegrationConfig, IntegrationResponse } from './BaseIntegration';
export declare class MetaAdsIntegration extends BaseIntegration {
    private baseUrl;
    constructor(prisma: PrismaClient, config: IntegrationConfig, integrationId: number);
    getName(): string;
    validateConfig(): Promise<boolean>;
    testConnection(): Promise<boolean>;
    fetchLeads(lastSyncDate?: Date, pageToken?: string): Promise<IntegrationResponse>;
    private processMetaLead;
}
//# sourceMappingURL=MetaAdsIntegration.d.ts.map