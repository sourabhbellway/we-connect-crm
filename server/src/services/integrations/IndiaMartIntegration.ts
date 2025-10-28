import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { BaseIntegration, IntegrationConfig, IntegrationResponse, LeadData } from './BaseIntegration';

export class IndiaMartIntegration extends BaseIntegration {
  private baseUrl = 'https://mapi.indiamart.com/wservce/crm/crmListing/v2';

  constructor(prisma: PrismaClient, config: IntegrationConfig, integrationId: number) {
    super(prisma, config, integrationId);
  }

  getName(): string {
    return 'IndiaMart';
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }
    return await this.testConnection();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          glusr_crm_key: this.config.apiKey,
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
          end_time: new Date().toISOString().slice(0, 19),
        },
      });
      return response.status === 200 && response.data.status === 'SUCCESS';
    } catch (error) {
      console.error('IndiaMart connection test failed:', error);
      return false;
    }
  }

  async fetchLeads(lastSyncDate?: Date, pageToken?: string): Promise<IntegrationResponse> {
    try {
      await this.logOperation('fetch_leads', 'PENDING', 'Starting IndiaMart lead fetch');

      const startTime = lastSyncDate 
        ? lastSyncDate.toISOString().slice(0, 19)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19); // Last 7 days by default

      const endTime = new Date().toISOString().slice(0, 19);

      const params: any = {
        glusr_crm_key: this.config.apiKey,
        start_time: startTime,
        end_time: endTime,
      };

      if (pageToken) {
        params.start_time = pageToken; // IndiaMart uses time-based pagination
      }

      const response = await axios.get(this.baseUrl, { params });

      if (response.data.status !== 'SUCCESS') {
        await this.logOperation(
          'fetch_leads',
          'FAILED',
          `IndiaMart API returned error: ${response.data.message || 'Unknown error'}`,
          response.data,
          response.data.message
        );
        return {
          success: false,
          error: response.data.message || 'IndiaMart API error',
          data: [],
        };
      }

      const leads: LeadData[] = [];
      if (response.data.RESPONSE && Array.isArray(response.data.RESPONSE)) {
        for (const lead of response.data.RESPONSE) {
          const processedLead = this.processIndiaMartLead(lead);
          if (processedLead) {
            leads.push(processedLead);
          }
        }
      }

      await this.logOperation(
        'fetch_leads',
        'SUCCESS',
        `Successfully fetched ${leads.length} leads from IndiaMart`,
        { totalCount: leads.length },
        undefined,
        leads.length
      );

      return {
        success: true,
        data: leads,
        totalCount: leads.length,
        hasMore: false, // IndiaMart doesn't provide clear pagination info
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logOperation(
        'fetch_leads',
        'FAILED',
        'Error fetching leads from IndiaMart',
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

  private processIndiaMartLead(lead: any): LeadData | null {
    try {
      if (!lead.SENDER_NAME && !lead.SENDER_EMAIL && !lead.SENDER_MOBILE) {
        return null;
      }

      // Parse the sender name
      const fullName = lead.SENDER_NAME || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Build notes with inquiry details
      let notes = `IndiaMart Inquiry - Product: ${lead.QUERY_PRODUCT_NAME || 'N/A'}`;
      if (lead.QUERY_MESSAGE) {
        notes += `\\nMessage: ${lead.QUERY_MESSAGE}`;
      }
      if (lead.CALL_DURATION) {
        notes += `\\nCall Duration: ${lead.CALL_DURATION}`;
      }
      if (lead.RECEIVER_MOBILE) {
        notes += `\\nReceived on: ${lead.RECEIVER_MOBILE}`;
      }

      return this.sanitizeLeadData({
        firstName,
        lastName,
        email: lead.SENDER_EMAIL || '',
        phone: lead.SENDER_MOBILE || '',
        company: lead.SENDER_COMPANY || '',
        position: '',
        notes,
        externalId: lead.UNIQUE_QUERY_ID || lead.QUERY_ID || `${lead.QUERY_TIME}_${lead.SENDER_MOBILE}`,
        source: 'IndiaMart',
        industry: lead.QUERY_PRODUCT_NAME || '',
        address: [lead.SENDER_ADDRESS, lead.SENDER_CITY, lead.SENDER_STATE, lead.SENDER_COUNTRY]
          .filter(Boolean)
          .join(', ') || '',
        city: lead.SENDER_CITY || '',
        state: lead.SENDER_STATE || '',
        country: lead.SENDER_COUNTRY || 'India',
        // Additional IndiaMart specific fields
        queryType: lead.QUERY_TYPE,
        queryTime: lead.QUERY_TIME,
        productName: lead.QUERY_PRODUCT_NAME,
        queryMessage: lead.QUERY_MESSAGE,
        callDuration: lead.CALL_DURATION,
        receiverMobile: lead.RECEIVER_MOBILE,
      });
    } catch (error) {
      console.error('Error processing IndiaMart lead:', error, lead);
      return null;
    }
  }
}