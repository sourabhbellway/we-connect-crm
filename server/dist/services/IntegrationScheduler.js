"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationScheduler = void 0;
const cron = __importStar(require("node-cron"));
const IntegrationManager_1 = require("./integrations/IntegrationManager");
class IntegrationScheduler {
    constructor(prisma) {
        this.scheduledTasks = new Map();
        this.prisma = prisma;
        this.integrationManager = new IntegrationManager_1.IntegrationManager(prisma);
    }
    async initialize() {
        try {
            console.log('Initializing Integration Scheduler...');
            // Initialize integrations first
            await this.integrationManager.initializeIntegrations();
            // Get business settings to check if auto-sync is enabled
            const settings = await this.prisma.businessSettings.findFirst();
            if (!settings) {
                console.log('No business settings found. Skipping scheduler initialization.');
                return;
            }
            // Schedule sync jobs for enabled integrations
            const enabledIntegrations = this.integrationManager.getEnabledIntegrations();
            for (const integrationName of enabledIntegrations) {
                await this.scheduleIntegrationSync(integrationName);
            }
            console.log(`Integration Scheduler initialized with ${enabledIntegrations.length} integrations`);
        }
        catch (error) {
            console.error('Error initializing Integration Scheduler:', error);
        }
    }
    async scheduleIntegrationSync(integrationName, cronExpression) {
        try {
            // Default sync schedules for different integrations
            const defaultSchedules = {
                'meta-ads': '*/15 * * * *', // Every 15 minutes (Facebook leads come frequently)
                'indiamart': '*/30 * * * *', // Every 30 minutes (B2B leads)
                'tradeindia': '0 */2 * * *', // Every 2 hours (B2B leads, less frequent)
            };
            const schedule = cronExpression || defaultSchedules[integrationName] || '0 */1 * * *'; // Default: every hour
            // Stop existing task if running
            if (this.scheduledTasks.has(integrationName)) {
                this.scheduledTasks.get(integrationName)?.stop();
                this.scheduledTasks.delete(integrationName);
            }
            // Create new scheduled task
            const task = cron.schedule(schedule, async () => {
                await this.syncIntegrationWithErrorHandling(integrationName);
            }, {
                timezone: 'UTC'
            });
            this.scheduledTasks.set(integrationName, task);
            console.log(`Scheduled ${integrationName} integration sync with cron: ${schedule}`);
        }
        catch (error) {
            console.error(`Error scheduling ${integrationName} integration:`, error);
        }
    }
    async syncIntegrationWithErrorHandling(integrationName) {
        try {
            console.log(`Starting scheduled sync for ${integrationName}...`);
            const result = await this.integrationManager.syncIntegration(integrationName);
            if (result.success) {
                console.log(`✓ ${integrationName} sync completed successfully. ${result.count || 0} leads synced.`);
            }
            else {
                console.error(`✗ ${integrationName} sync failed: ${result.error}`);
            }
        }
        catch (error) {
            console.error(`Error during scheduled sync of ${integrationName}:`, error);
        }
    }
    async stopIntegrationSync(integrationName) {
        const task = this.scheduledTasks.get(integrationName);
        if (task) {
            task.stop();
            this.scheduledTasks.delete(integrationName);
            console.log(`Stopped scheduled sync for ${integrationName}`);
        }
    }
    async stopAllSyncs() {
        for (const [integrationName, task] of this.scheduledTasks) {
            task.stop();
            console.log(`Stopped scheduled sync for ${integrationName}`);
        }
        this.scheduledTasks.clear();
        console.log('All integration syncs stopped');
    }
    async rescheduleIntegrationSync(integrationName, newSchedule) {
        await this.stopIntegrationSync(integrationName);
        await this.scheduleIntegrationSync(integrationName, newSchedule);
    }
    getActiveSchedules() {
        const schedules = [];
        for (const [integrationName, task] of this.scheduledTasks) {
            // Get schedule info (cron expression is not directly accessible, so we'll use defaults)
            const defaultSchedules = {
                'meta-ads': '*/15 * * * *',
                'indiamart': '*/30 * * * *',
                'tradeindia': '0 */2 * * *',
            };
            schedules.push({
                integration: integrationName,
                schedule: defaultSchedules[integrationName] || '0 */1 * * *',
                isRunning: true, // Task is active if it's in the map
            });
        }
        return schedules;
    }
    async syncAllIntegrationsNow() {
        console.log('Manual sync triggered for all integrations...');
        return await this.integrationManager.syncAllIntegrations();
    }
    async syncSpecificIntegrationNow(integrationName) {
        console.log(`Manual sync triggered for ${integrationName}...`);
        return await this.integrationManager.syncIntegration(integrationName);
    }
    // Health check method to ensure scheduler is running properly
    async healthCheck() {
        try {
            const scheduledCount = this.scheduledTasks.size;
            const runningCount = this.scheduledTasks.size; // All tasks in the map are considered running
            // Get last sync times from integration logs
            const lastSyncTimes = {};
            const enabledIntegrations = this.integrationManager.getEnabledIntegrations();
            for (const integrationName of enabledIntegrations) {
                const lastLog = await this.prisma.integrationLog.findFirst({
                    where: {
                        integration: { name: integrationName },
                        operation: 'fetch_leads',
                        status: 'SUCCESS',
                    },
                    orderBy: { createdAt: 'desc' },
                });
                lastSyncTimes[integrationName] = lastLog?.createdAt || null;
            }
            // Determine health status
            let status = 'healthy';
            if (scheduledCount === 0) {
                status = 'unhealthy';
            }
            else if (runningCount < scheduledCount) {
                status = 'degraded';
            }
            return {
                status,
                scheduledIntegrations: scheduledCount,
                runningTasks: runningCount,
                lastSyncTimes,
            };
        }
        catch (error) {
            console.error('Error during scheduler health check:', error);
            return {
                status: 'unhealthy',
                scheduledIntegrations: 0,
                runningTasks: 0,
                lastSyncTimes: {},
            };
        }
    }
    // Update schedules when settings change
    async updateSchedulesFromSettings() {
        try {
            const settings = await this.prisma.businessSettings.findFirst();
            if (!settings) {
                return;
            }
            // Re-initialize integrations in case settings changed
            await this.integrationManager.initializeIntegrations();
            // Get currently enabled integrations
            const enabledIntegrations = this.integrationManager.getEnabledIntegrations();
            // Stop all current tasks
            await this.stopAllSyncs();
            // Restart tasks for enabled integrations
            for (const integrationName of enabledIntegrations) {
                await this.scheduleIntegrationSync(integrationName);
            }
            console.log('Integration schedules updated from settings');
        }
        catch (error) {
            console.error('Error updating schedules from settings:', error);
        }
    }
}
exports.IntegrationScheduler = IntegrationScheduler;
//# sourceMappingURL=IntegrationScheduler.js.map