import { PrismaClient } from '@prisma/client';
export declare class IntegrationManager {
    private prisma;
    private integrations;
    constructor(prisma: PrismaClient);
    initializeIntegrations(): Promise<void>;
    private getOrCreateIntegration;
    private getIntegrationConfig;
    syncAllIntegrations(): Promise<{
        success: boolean;
        results: Array<{
            integration: string;
            success: boolean;
            error?: string;
            count?: number;
        }>;
    }>;
    syncIntegration(integrationName: string): Promise<{
        success: boolean;
        error?: string;
        count?: number;
    }>;
    testIntegration(integrationName: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    getEnabledIntegrations(): string[];
    getIntegrationLogs(integrationName?: string, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=IntegrationManager.d.ts.map