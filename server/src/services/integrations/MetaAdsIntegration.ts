import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { BaseIntegration, IntegrationConfig, IntegrationResponse, LeadData } from './BaseIntegration';

export class MetaAdsIntegration extends BaseIntegration {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(prisma: PrismaClient, config: IntegrationConfig, integrationId: number) {
    super(prisma, config, integrationId);
  }

  getName(): string {
    return 'Meta Ads (Facebook)';
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return false;
    }
    return await this.testConnection();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: this.config.apiKey,
          fields: 'id,name',
        },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Meta Ads connection test failed:', error);
      return false;
    }
  }

  async fetchLeads(lastSyncDate?: Date, pageToken?: string): Promise<IntegrationResponse> {
    try {
      await this.logOperation('fetch_leads', 'PENDING', 'Starting Meta Ads lead fetch');

      // First, get ad accounts
      const accountsResponse = await axios.get(`${this.baseUrl}/me/adaccounts`, {
        params: {
          access_token: this.config.apiKey,
          fields: 'id,name',
        },
      });

      if (!accountsResponse.data.data || accountsResponse.data.data.length === 0) {
        await this.logOperation(
          'fetch_leads', 
          'FAILED', 
          'No ad accounts found',
          undefined,
          'No ad accounts available'
        );
        return {
          success: false,
          error: 'No ad accounts found',
          data: [],
        };
      }

      const allLeads: LeadData[] = [];
      let totalCount = 0;

      // Fetch leads from each ad account
      for (const account of accountsResponse.data.data) {
        try {
          const params: any = {
            access_token: this.config.apiKey,
            fields: 'id,created_time,ad_id,adset_id,campaign_id,form_id,field_data',
            limit: 100,
          };

          if (lastSyncDate) {
            params.filtering = JSON.stringify([
              {
                field: 'time_created',
                operator: 'GREATER_THAN',
                value: Math.floor(lastSyncDate.getTime() / 1000),
              },
            ]);
          }

          if (pageToken) {
            params.after = pageToken;
          }

          const leadsResponse = await axios.get(`${this.baseUrl}/${account.id}/leadgen_forms`, {
            params,
          });

          if (leadsResponse.data.data && leadsResponse.data.data.length > 0) {
            // For each form, fetch the actual leads
            for (const form of leadsResponse.data.data) {
              const formLeadsResponse = await axios.get(`${this.baseUrl}/${form.id}/leads`, {
                params: {
                  access_token: this.config.apiKey,
                  fields: 'id,created_time,ad_id,adset_id,campaign_id,form_id,field_data',
                  limit: 100,
                },
              });

              if (formLeadsResponse.data.data) {
                const processedLeads = formLeadsResponse.data.data.map((lead: any) => 
                  this.processMetaLead(lead)
                ).filter((lead: LeadData | null) => lead !== null);

                allLeads.push(...processedLeads);
                totalCount += formLeadsResponse.data.data.length;
              }
            }
          }
        } catch (accountError) {
          console.error(`Error fetching leads for account ${account.id}:`, accountError);
          await this.logOperation(
            'fetch_leads',
            'PARTIAL',
            `Error fetching leads for account ${account.id}`,
            { accountId: account.id },
            accountError instanceof Error ? accountError.message : 'Unknown error'
          );
        }
      }

      await this.logOperation(
        'fetch_leads',
        'SUCCESS',
        `Successfully fetched ${allLeads.length} leads from Meta Ads`,
        { totalCount: allLeads.length },
        undefined,
        allLeads.length
      );

      return {
        success: true,
        data: allLeads,
        totalCount,
        hasMore: false, // Meta API pagination is more complex, simplified for now
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logOperation(
        'fetch_leads',
        'FAILED',
        'Error fetching leads from Meta Ads',
        undefined,
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
        data: [],
      };
    }
  }

  private processMetaLead(lead: any): LeadData | null {
    try {
      if (!lead.field_data || !Array.isArray(lead.field_data)) {
        return null;
      }

      const fieldData = lead.field_data.reduce((acc: any, field: any) => {
        if (field.name && field.values && field.values.length > 0) {
          acc[field.name.toLowerCase()] = field.values[0];
        }
        return acc;
      }, {});

      // Extract common fields from Meta lead forms
      const firstName = fieldData.first_name || fieldData.full_name?.split(' ')[0] || '';
      const lastName = fieldData.last_name || fieldData.full_name?.split(' ').slice(1).join(' ') || '';
      const email = fieldData.email || '';
      const phone = fieldData.phone_number || fieldData.phone || '';
      const company = fieldData.company_name || fieldData.company || '';

      if (!firstName && !lastName && !email) {
        return null; // Skip if no essential data
      }

      return this.sanitizeLeadData({
        firstName,
        lastName,
        email,
        phone,
        company,
        notes: `Meta Ads Lead - Campaign: ${lead.campaign_id}, Ad: ${lead.ad_id}, Form: ${lead.form_id}`,
        externalId: lead.id,
        source: 'Meta Ads',
        createdAt: lead.created_time,
        ...fieldData, // Include any additional custom fields
      });
    } catch (error) {
      console.error('Error processing Meta lead:', error, lead);
      return null;
    }
  }
}