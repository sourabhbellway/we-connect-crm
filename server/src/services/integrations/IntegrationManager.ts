import { PrismaClient } from '@prisma/client';
import { BaseIntegration, IntegrationConfig } from './BaseIntegration';
import { MetaAdsIntegration } from './MetaAdsIntegration';
import { IndiaMartIntegration } from './IndiaMartIntegration';
import { TradeIndiaIntegration } from './TradeIndiaIntegration';

export class IntegrationManager {
  private prisma: PrismaClient;
  private integrations: Map<string, BaseIntegration> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async initializeIntegrations(): Promise<void> {
    try {
      // Get business settings for API keys
      const businessSettings = await this.prisma.businessSettings.findFirst();
      
      if (!businessSettings) {
        console.log('No business settings found. Skipping integration initialization.');
        return;
      }

      // Initialize Meta Ads integration
      if (businessSettings.metaAdsEnabled && businessSettings.metaAdsApiKey) {
        const metaIntegration = await this.getOrCreateIntegration('meta-ads');
        if (metaIntegration) {
          const metaConfig: IntegrationConfig = {
            apiKey: businessSettings.metaAdsApiKey,
            apiSecret: businessSettings.metaAdsApiSecret || undefined,
          };
          this.integrations.set('meta-ads', new MetaAdsIntegration(this.prisma, metaConfig, metaIntegration.id));
        }
      }

      // Initialize IndiaMart integration
      if (businessSettings.indiamartEnabled && businessSettings.indiamartApiKey) {
        const indiamartIntegration = await this.getOrCreateIntegration('indiamart');
        if (indiamartIntegration) {
          const indiamartConfig: IntegrationConfig = {
            apiKey: businessSettings.indiamartApiKey,
            apiSecret: businessSettings.indiamartApiSecret || undefined,
          };
          this.integrations.set('indiamart', new IndiaMartIntegration(this.prisma, indiamartConfig, indiamartIntegration.id));
        }
      }

      // Initialize TradeIndia integration
      if (businessSettings.tradindiaEnabled && businessSettings.tradindiaApiKey) {
        const tradindiaIntegration = await this.getOrCreateIntegration('tradeindia');
        if (tradindiaIntegration) {
          const tradindiaConfig: IntegrationConfig = {
            apiKey: businessSettings.tradindiaApiKey,
            apiSecret: businessSettings.tradindiaApiSecret || undefined,
          };
          this.integrations.set('tradeindia', new TradeIndiaIntegration(this.prisma, tradindiaConfig, tradindiaIntegration.id));
        }
      }

      console.log(`Initialized ${this.integrations.size} integrations`);
    } catch (error) {
      console.error('Error initializing integrations:', error);
    }
  }

  private async getOrCreateIntegration(name: string): Promise<{ id: number } | null> {
    try {
      let integration = await this.prisma.thirdPartyIntegration.findUnique({
        where: { name },
      });

      if (!integration) {
        const integrationConfig = this.getIntegrationConfig(name);
        integration = await this.prisma.thirdPartyIntegration.create({
          data: integrationConfig,
        });
      }

      return integration;
    } catch (error) {
      console.error(`Error getting/creating integration ${name}:`, error);
      return null;
    }
  }

  private getIntegrationConfig(name: string) {
    const configs: Record<string, any> = {
      'meta-ads': {
        name: 'meta-ads',
        displayName: 'Meta Ads (Facebook)',
        description: 'Fetch leads from Facebook Lead Ads campaigns',
        apiEndpoint: 'https://graph.facebook.com',
        authType: 'API_KEY',
      },
      'indiamart': {
        name: 'indiamart',
        displayName: 'IndiaMart',
        description: 'Fetch leads from IndiaMart inquiries',
        apiEndpoint: 'https://mapi.indiamart.com',
        authType: 'API_KEY',
      },
      'tradeindia': {
        name: 'tradeindia',
        displayName: 'TradeIndia',
        description: 'Fetch leads from TradeIndia buyer inquiries',
        apiEndpoint: 'https://api.tradeindia.com',
        authType: 'API_KEY',
      },
    };

    return configs[name] || null;
  }

  async syncAllIntegrations(): Promise<{ 
    success: boolean; 
    results: Array<{ integration: string; success: boolean; error?: string; count?: number }>;
  }> {
    const results: Array<{ integration: string; success: boolean; error?: string; count?: number }> = [];

    for (const [name, integration] of this.integrations) {
      try {
        // Get last sync date for this integration
        const lastLog = await this.prisma.integrationLog.findFirst({
          where: {
            integration: { name },
            status: 'SUCCESS',
            operation: 'fetch_leads',
          },
          orderBy: { createdAt: 'desc' },
        });

        const lastSyncDate = lastLog?.createdAt;
        const response = await integration.fetchLeads(lastSyncDate || undefined);

        if (response.success && response.data) {
          // Sync each lead
          let successCount = 0;
          let errorCount = 0;

          for (const leadData of response.data) {
            const syncResult = await integration['syncLead'](leadData);
            if (syncResult.success) {
              successCount++;
            } else {
              errorCount++;
            }
          }

          results.push({
            integration: name,
            success: true,
            count: successCount,
          });

          if (errorCount > 0) {
            console.log(`${name}: ${successCount} synced successfully, ${errorCount} failed`);
          }
        } else {
          results.push({
            integration: name,
            success: false,
            error: response.error,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          integration: name,
          success: false,
          error: errorMessage,
        });
        console.error(`Error syncing ${name}:`, error);
      }
    }

    const overallSuccess = results.every(r => r.success);
    return { success: overallSuccess, results };
  }

  async syncIntegration(integrationName: string): Promise<{
    success: boolean;
    error?: string;
    count?: number;
  }> {
    const integration = this.integrations.get(integrationName);
    
    if (!integration) {
      return {
        success: false,
        error: `Integration ${integrationName} not found or not enabled`,
      };
    }

    try {
      // Get last sync date for this integration
      const lastLog = await this.prisma.integrationLog.findFirst({
        where: {
          integration: { name: integrationName },
          status: 'SUCCESS',
          operation: 'fetch_leads',
        },
        orderBy: { createdAt: 'desc' },
      });

      const lastSyncDate = lastLog?.createdAt;
      const response = await integration.fetchLeads(lastSyncDate || undefined);

      if (response.success && response.data) {
        // Sync each lead
        let successCount = 0;
        let errorCount = 0;

        for (const leadData of response.data) {
          const syncResult = await integration['syncLead'](leadData);
          if (syncResult.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }

        return {
          success: true,
          count: successCount,
        };
      } else {
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async testIntegration(integrationName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const integration = this.integrations.get(integrationName);
    
    if (!integration) {
      return {
        success: false,
        error: `Integration ${integrationName} not found or not enabled`,
      };
    }

    try {
      const isValid = await integration.testConnection();
      return {
        success: isValid,
        error: isValid ? undefined : 'Connection test failed',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  getEnabledIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  async getIntegrationLogs(integrationName?: string, limit: number = 50): Promise<any[]> {
    const whereCondition = integrationName ? { integration: { name: integrationName } } : {};

    return await this.prisma.integrationLog.findMany({
      where: whereCondition,
      include: {
        integration: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}