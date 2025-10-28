import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { BaseIntegration, IntegrationConfig, IntegrationResponse, LeadData } from './BaseIntegration';

export class TradeIndiaIntegration extends BaseIntegration {
  private baseUrl = 'https://api.tradeindia.com/api';

  constructor(prisma: PrismaClient, config: IntegrationConfig, integrationId: number) {
    super(prisma, config, integrationId);
  }

  getName(): string {
    return 'TradeIndia';
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      return false;
    }
    return await this.testConnection();
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/leads`, {
        params: {
          api_key: this.config.apiKey,
          api_secret: this.config.apiSecret,
          limit: 1,
        },
      });
      return response.status === 200 && response.data.status === 'success';
    } catch (error) {
      console.error('TradeIndia connection test failed:', error);
      return false;
    }
  }

  async fetchLeads(lastSyncDate?: Date, pageToken?: string): Promise<IntegrationResponse> {
    try {
      await this.logOperation('fetch_leads', 'PENDING', 'Starting TradeIndia lead fetch');

      const params: any = {
        api_key: this.config.apiKey,
        api_secret: this.config.apiSecret,
        limit: 100,
      };

      if (lastSyncDate) {
        params.from_date = lastSyncDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      }

      if (pageToken) {
        params.page = pageToken;
      }

      const response = await axios.get(`${this.baseUrl}/leads`, { params });

      if (response.data.status !== 'success') {
        await this.logOperation(
          'fetch_leads',
          'FAILED',
          `TradeIndia API returned error: ${response.data.message || 'Unknown error'}`,
          response.data,
          response.data.message
        );
        return {
          success: false,
          error: response.data.message || 'TradeIndia API error',
          data: [],
        };
      }

      const leads: LeadData[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        for (const lead of response.data.data) {
          const processedLead = this.processTradeIndiaLead(lead);
          if (processedLead) {
            leads.push(processedLead);
          }
        }
      }

      const hasMore = response.data.pagination && 
        response.data.pagination.current_page < response.data.pagination.total_pages;

      await this.logOperation(
        'fetch_leads',
        'SUCCESS',
        `Successfully fetched ${leads.length} leads from TradeIndia`,
        { 
          totalCount: leads.length,
          pagination: response.data.pagination,
        },
        undefined,
        leads.length
      );

      return {
        success: true,
        data: leads,
        totalCount: response.data.pagination?.total_records || leads.length,
        hasMore,
        nextPageToken: hasMore ? String(response.data.pagination.current_page + 1) : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logOperation(
        'fetch_leads',
        'FAILED',
        'Error fetching leads from TradeIndia',
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

  private processTradeIndiaLead(lead: any): LeadData | null {
    try {
      if (!lead.buyer_name && !lead.buyer_email && !lead.buyer_phone) {
        return null;
      }

      // Parse the buyer name
      const fullName = lead.buyer_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Build notes with inquiry details
      let notes = `TradeIndia Inquiry - Product: ${lead.product_name || 'N/A'}`;
      if (lead.inquiry_message) {
        notes += `\\nMessage: ${lead.inquiry_message}`;
      }
      if (lead.quantity_required) {
        notes += `\\nQuantity Required: ${lead.quantity_required}`;
      }
      if (lead.inquiry_type) {
        notes += `\\nInquiry Type: ${lead.inquiry_type}`;
      }
      if (lead.budget_range) {
        notes += `\\nBudget Range: ${lead.budget_range}`;
      }

      // Extract budget from budget_range if available
      let budget: number | undefined;
      if (lead.budget_range) {
        const budgetMatch = lead.budget_range.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
        if (budgetMatch) {
          budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
        }
      }

      return this.sanitizeLeadData({
        firstName,
        lastName,
        email: lead.buyer_email || '',
        phone: lead.buyer_phone || lead.buyer_mobile || '',
        company: lead.buyer_company || '',
        position: '',
        notes,
        externalId: lead.inquiry_id || lead.lead_id || `${lead.inquiry_date}_${lead.buyer_phone}`,
        source: 'TradeIndia',
        industry: lead.product_category || '',
        website: lead.buyer_website || '',
        address: [lead.buyer_address, lead.buyer_city, lead.buyer_state, lead.buyer_country]
          .filter(Boolean)
          .join(', ') || '',
        city: lead.buyer_city || '',
        state: lead.buyer_state || '',
        country: lead.buyer_country || 'India',
        budget,
        // Additional TradeIndia specific fields
        productName: lead.product_name,
        productCategory: lead.product_category,
        quantityRequired: lead.quantity_required,
        inquiryType: lead.inquiry_type,
        inquiryMessage: lead.inquiry_message,
        inquiryDate: lead.inquiry_date,
        budgetRange: lead.budget_range,
      });
    } catch (error) {
      console.error('Error processing TradeIndia lead:', error, lead);
      return null;
    }
  }
}