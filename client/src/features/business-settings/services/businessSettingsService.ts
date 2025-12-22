import { apiRequest } from '../../../services/apiClient';
import {
  BusinessSettings,
  BusinessSettingsResponse,
  CompanySettings,
  CurrencySettings,
  TaxSettings,
  LeadSource,
  LeadStatus,
  DealStatus,
  ProductCategory,
  PriceList,
  EmailTemplate,
  QuotationTemplate,
  InvoiceTemplate,
  NotificationSettings,
  AutomationRule,
  IntegrationSettings,
  PaymentGatewaySettings,
} from '../types';

class BusinessSettingsService {
  private readonly baseUrl = '/business-settings';

  // Company Settings
  async getCompanySettings(): Promise<BusinessSettingsResponse<CompanySettings>> {
    return apiRequest.get(`${this.baseUrl}/company`);
  }

  async updateCompanySettings(data: Partial<CompanySettings>): Promise<BusinessSettingsResponse<CompanySettings>> {
    return apiRequest.put(`${this.baseUrl}/company`, data);
  }

  async uploadCompanyLogo(file: File): Promise<BusinessSettingsResponse<{ logoUrl: string }>> {
    const formData = new FormData();
    formData.append('logo', file);
    return apiRequest.post(`${this.baseUrl}/company/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Currency & Tax Settings
  async getCurrencySettings(): Promise<BusinessSettingsResponse<CurrencySettings>> {
    return apiRequest.get(`${this.baseUrl}/currency`);
  }

  async updateCurrencySettings(data: Partial<CurrencySettings>): Promise<BusinessSettingsResponse<CurrencySettings>> {
    return apiRequest.put(`${this.baseUrl}/currency`, data);
  }

  async getTaxSettings(): Promise<BusinessSettingsResponse<TaxSettings>> {
    return apiRequest.get(`${this.baseUrl}/tax`);
  }

  async updateTaxSettings(data: Partial<TaxSettings>): Promise<BusinessSettingsResponse<TaxSettings>> {
    return apiRequest.put(`${this.baseUrl}/tax`, data);
  }

  async getExchangeRates(): Promise<BusinessSettingsResponse<Record<string, number>>> {
    return apiRequest.get(`${this.baseUrl}/currency/exchange-rates`);
  }

  async refreshExchangeRates(): Promise<BusinessSettingsResponse<Record<string, number>>> {
    return apiRequest.post(`${this.baseUrl}/currency/refresh-rates`);
  }

  // Lead Sources - use dedicated lead-sources API
  async getLeadSources(): Promise<BusinessSettingsResponse<LeadSource[]>> {
    return apiRequest.get(`/lead-sources`);
  }

  async createLeadSource(data: Partial<LeadSource>): Promise<BusinessSettingsResponse<LeadSource>> {
    return apiRequest.post(`/lead-sources`, data);
  }

  async updateLeadSource(id: string, data: Partial<LeadSource>): Promise<BusinessSettingsResponse<LeadSource>> {
    return apiRequest.put(`/lead-sources/${id}`, data);
  }

  async deleteLeadSource(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`/lead-sources/${id}`);
  }

  async reorderLeadSources(sourceIds: string[]): Promise<BusinessSettingsResponse<LeadSource[]>> {
    // Backend reorder endpoint is not yet implemented; keep signature for future use.
    return apiRequest.put(`/lead-sources/reorder`, { sourceIds });
  }

  // Lead Statuses (Fixed)
  async getLeadStatuses(): Promise<BusinessSettingsResponse<LeadStatus[]>> {
    return apiRequest.get(`${this.baseUrl}/lead-statuses`);
  }

  // Deal Statuses (Dynamic)
  async getDealStatuses(): Promise<BusinessSettingsResponse<DealStatus[]>> {
    return apiRequest.get(`${this.baseUrl}/deal-statuses`);
  }

  async createDealStatus(data: Partial<DealStatus>): Promise<BusinessSettingsResponse<DealStatus>> {
    return apiRequest.post(`${this.baseUrl}/deal-statuses`, data);
  }

  async updateDealStatus(id: string, data: Partial<DealStatus>): Promise<BusinessSettingsResponse<DealStatus>> {
    return apiRequest.put(`${this.baseUrl}/deal-statuses/${id}`, data);
  }

  async deleteDealStatus(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/deal-statuses/${id}`);
  }

  // Product Categories
  async getProductCategories(): Promise<BusinessSettingsResponse<ProductCategory[]>> {
    return apiRequest.get(`${this.baseUrl}/product-categories`);
  }

  async createProductCategory(data: Omit<ProductCategory, 'id'>): Promise<BusinessSettingsResponse<ProductCategory>> {
    return apiRequest.post(`${this.baseUrl}/product-categories`, data);
  }

  async updateProductCategory(id: string, data: Partial<ProductCategory>): Promise<BusinessSettingsResponse<ProductCategory>> {
    return apiRequest.put(`${this.baseUrl}/product-categories/${id}`, data);
  }

  async deleteProductCategory(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/product-categories/${id}`);
  }

  // Price Lists
  async getPriceLists(): Promise<BusinessSettingsResponse<PriceList[]>> {
    return apiRequest.get(`${this.baseUrl}/price-lists`);
  }

  async createPriceList(data: Omit<PriceList, 'id'>): Promise<BusinessSettingsResponse<PriceList>> {
    return apiRequest.post(`${this.baseUrl}/price-lists`, data);
  }

  async updatePriceList(id: string, data: Partial<PriceList>): Promise<BusinessSettingsResponse<PriceList>> {
    return apiRequest.put(`${this.baseUrl}/price-lists/${id}`, data);
  }

  async deletePriceList(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/price-lists/${id}`);
  }

  // Email Templates
  async getEmailTemplates(): Promise<BusinessSettingsResponse<EmailTemplate[]>> {
    return apiRequest.get(`${this.baseUrl}/email-templates`);
  }

  async getEmailTemplate(id: string): Promise<BusinessSettingsResponse<EmailTemplate>> {
    return apiRequest.get(`${this.baseUrl}/email-templates/${id}`);
  }

  async createEmailTemplate(data: Omit<EmailTemplate, 'id'>): Promise<BusinessSettingsResponse<EmailTemplate>> {
    return apiRequest.post(`${this.baseUrl}/email-templates`, data);
  }

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<BusinessSettingsResponse<EmailTemplate>> {
    return apiRequest.put(`${this.baseUrl}/email-templates/${id}`, data);
  }

  async deleteEmailTemplate(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/email-templates/${id}`);
  }

  async duplicateEmailTemplate(id: string): Promise<BusinessSettingsResponse<EmailTemplate>> {
    return apiRequest.post(`${this.baseUrl}/email-templates/${id}/duplicate`);
  }

  async previewEmailTemplate(id: string, data: Record<string, any>): Promise<BusinessSettingsResponse<{ preview: string }>> {
    return apiRequest.post(`${this.baseUrl}/email-templates/${id}/preview`, data);
  }

  // Quotation Templates
  async getQuotationTemplates(): Promise<BusinessSettingsResponse<QuotationTemplate[]>> {
    return apiRequest.get(`${this.baseUrl}/quotation-templates`);
  }

  async createQuotationTemplate(data: Omit<QuotationTemplate, 'id'>): Promise<BusinessSettingsResponse<QuotationTemplate>> {
    return apiRequest.post(`${this.baseUrl}/quotation-templates`, data);
  }

  async updateQuotationTemplate(id: string, data: Partial<QuotationTemplate>): Promise<BusinessSettingsResponse<QuotationTemplate>> {
    return apiRequest.put(`${this.baseUrl}/quotation-templates/${id}`, data);
  }

  async deleteQuotationTemplate(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/quotation-templates/${id}`);
  }

  async setDefaultQuotationTemplate(id: string): Promise<BusinessSettingsResponse<QuotationTemplate>> {
    return apiRequest.put(`${this.baseUrl}/quotation-templates/${id}/set-default`);
  }

  // Invoice Templates
  async getInvoiceTemplates(): Promise<BusinessSettingsResponse<InvoiceTemplate[]>> {
    return apiRequest.get(`${this.baseUrl}/invoice-templates`);
  }

  async createInvoiceTemplate(data: Omit<InvoiceTemplate, 'id'>): Promise<BusinessSettingsResponse<InvoiceTemplate>> {
    return apiRequest.post(`${this.baseUrl}/invoice-templates`, data);
  }

  async updateInvoiceTemplate(id: string, data: Partial<InvoiceTemplate>): Promise<BusinessSettingsResponse<InvoiceTemplate>> {
    return apiRequest.put(`${this.baseUrl}/invoice-templates/${id}`, data);
  }

  async deleteInvoiceTemplate(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/invoice-templates/${id}`);
  }

  async setDefaultInvoiceTemplate(id: string): Promise<BusinessSettingsResponse<InvoiceTemplate>> {
    return apiRequest.put(`${this.baseUrl}/invoice-templates/${id}/set-default`);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<BusinessSettingsResponse<NotificationSettings>> {
    return apiRequest.get(`${this.baseUrl}/notifications`);
  }

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<BusinessSettingsResponse<NotificationSettings>> {
    return apiRequest.put(`${this.baseUrl}/notifications`, data);
  }

  async testNotification(channel: string, recipient: string): Promise<BusinessSettingsResponse<{ success: boolean }>> {
    return apiRequest.post(`${this.baseUrl}/notifications/test`, { channel, recipient });
  }

  // Automation Rules
  async getAutomationRules(): Promise<BusinessSettingsResponse<AutomationRule[]>> {
    return apiRequest.get(`${this.baseUrl}/automation-rules`);
  }

  async getAutomationRule(id: string): Promise<BusinessSettingsResponse<AutomationRule>> {
    return apiRequest.get(`${this.baseUrl}/automation-rules/${id}`);
  }

  async createAutomationRule(data: Omit<AutomationRule, 'id'>): Promise<BusinessSettingsResponse<AutomationRule>> {
    return apiRequest.post(`${this.baseUrl}/automation-rules`, data);
  }

  async updateAutomationRule(id: string, data: Partial<AutomationRule>): Promise<BusinessSettingsResponse<AutomationRule>> {
    return apiRequest.put(`${this.baseUrl}/automation-rules/${id}`, data);
  }

  async deleteAutomationRule(id: string): Promise<BusinessSettingsResponse<void>> {
    return apiRequest.delete(`${this.baseUrl}/automation-rules/${id}`);
  }

  async toggleAutomationRule(id: string): Promise<BusinessSettingsResponse<AutomationRule>> {
    return apiRequest.put(`${this.baseUrl}/automation-rules/${id}/toggle`);
  }

  async testAutomationRule(id: string, testData: any): Promise<BusinessSettingsResponse<{ result: any }>> {
    return apiRequest.post(`${this.baseUrl}/automation-rules/${id}/test`, testData);
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<BusinessSettingsResponse<IntegrationSettings>> {
    return apiRequest.get(`${this.baseUrl}/integrations`);
  }

  async updateIntegrationSettings(data: Partial<IntegrationSettings>): Promise<BusinessSettingsResponse<IntegrationSettings>> {
    return apiRequest.put(`${this.baseUrl}/integrations`, data);
  }

  async testIntegration(type: string): Promise<BusinessSettingsResponse<{ success: boolean; message: string }>> {
    return apiRequest.post(`${this.baseUrl}/integrations/${type}/test`);
  }

  async syncIntegrationData(type: string): Promise<BusinessSettingsResponse<{ synced: number; errors: any[] }>> {
    return apiRequest.post(`${this.baseUrl}/integrations/${type}/sync`);
  }

  // Payment Gateway Settings
  async getPaymentGatewaySettings(): Promise<BusinessSettingsResponse<PaymentGatewaySettings>> {
    return apiRequest.get(`${this.baseUrl}/payment-gateways`);
  }

  async updatePaymentGatewaySettings(data: Partial<PaymentGatewaySettings>): Promise<BusinessSettingsResponse<PaymentGatewaySettings>> {
    return apiRequest.put(`${this.baseUrl}/payment-gateways`, data);
  }

  async testPaymentGateway(gateway: string): Promise<BusinessSettingsResponse<{ success: boolean; message: string }>> {
    return apiRequest.post(`${this.baseUrl}/payment-gateways/${gateway}/test`);
  }

  // Bulk Operations
  async exportSettings(categories: string[]): Promise<BusinessSettingsResponse<{ exportUrl: string }>> {
    return apiRequest.post(`${this.baseUrl}/export`, { categories });
  }

  async importSettings(file: File): Promise<BusinessSettingsResponse<{ imported: number; errors: any[] }>> {
    const formData = new FormData();
    formData.append('settings', file);
    return apiRequest.post(`${this.baseUrl}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async resetSettings(categories: string[]): Promise<BusinessSettingsResponse<{ reset: string[] }>> {
    return apiRequest.post(`${this.baseUrl}/reset`, { categories });
  }

  // Health & Status
  async getSettingsHealth(): Promise<BusinessSettingsResponse<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{ name: string; status: string; message?: string }>;
  }>> {
    return apiRequest.get(`${this.baseUrl}/health`);
  }

  // Complete Business Settings (for context provider)
  async getAllBusinessSettings(): Promise<BusinessSettingsResponse<BusinessSettings>> {
    return apiRequest.get(`${this.baseUrl}/all`);
  }
}

// Create singleton instance
export const businessSettingsService = new BusinessSettingsService();
export default businessSettingsService;