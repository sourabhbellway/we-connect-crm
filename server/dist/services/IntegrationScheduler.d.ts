import { PrismaClient } from '@prisma/client';
export declare class IntegrationScheduler {
    private prisma;
    private integrationManager;
    private scheduledTasks;
    constructor(prisma: PrismaClient);
    initialize(): Promise<void>;
    scheduleIntegrationSync(integrationName: string, cronExpression?: string): Promise<void>;
    private syncIntegrationWithErrorHandling;
    stopIntegrationSync(integrationName: string): Promise<void>;
    stopAllSyncs(): Promise<void>;
    rescheduleIntegrationSync(integrationName: string, newSchedule: string): Promise<void>;
    getActiveSchedules(): Array<{
        integration: string;
        schedule: string;
        isRunning: boolean;
    }>;
    syncAllIntegrationsNow(): Promise<{
        success: boolean;
        results: Array<{
            integration: string;
            success: boolean;
            error?: string;
            count?: number;
        }>;
    }>;
    syncSpecificIntegrationNow(integrationName: string): Promise<{
        success: boolean;
        error?: string;
        count?: number;
    }>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        scheduledIntegrations: number;
        runningTasks: number;
        lastSyncTimes: Record<string, Date | null>;
    }>;
    updateSchedulesFromSettings(): Promise<void>;
}
//# sourceMappingURL=IntegrationScheduler.d.ts.map