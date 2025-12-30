import apiClient from './apiClient';

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

class AnalyticsService {
  async getLeadStatusDistribution(userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/lead-status-distribution?${params}`);
    return response.data;
  }

  async getRevenueTrends(months: number = 12, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/revenue-trends?${params}`);
    return response.data;
  }

  async getActivityTrends(months: number = 12, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/activity-trends?${params}`);
    return response.data;
  }

  async getUserGrowth(months: number = 12) {
    const response = await apiClient.get(`/analytics/charts/user-growth?months=${months}`);
    return response.data;
  }

  async getLeadConversionFunnel(userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/lead-conversion-funnel?${params}`);
    return response.data;
  }

  async getSalesPipelineFlow(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/sales-pipeline-flow?${params}`);
    return response.data;
  }

  async getTopPerformers(limit: number = 5, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/top-performers?${params}`);
    return response.data;
  }

  async getDealVelocity(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/deal-velocity?${params}`);
    return response.data;
  }

  async getKPIs(startDate?: string, endDate?: string, userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/dashboard/kpis?${params}`);
    return response.data;
  }

  async getLeadSourceDistribution(userId?: number, scope: 'all' | 'me' = 'all') {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/charts/lead-source-distribution?${params}`);
    return response.data;
  }

  async getTaskReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/task?${params}`);
    return response.data;
  }

  async getLeadReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/lead?${params}`);
    return response.data;
  }

  async getDealReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/deal?${params}`);
    return response.data;
  }

  async getExpenseReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/expense?${params}`);
    return response.data;
  }

  async getInvoiceReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/invoice?${params}`);
    return response.data;
  }

  async getQuotationReport(months: number = 6, userId?: number, scope: 'all' | 'me' = 'all', page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    if (userId) params.append('userId', userId.toString());
    params.append('scope', scope);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters) params.append('filters', JSON.stringify(filters));

    const response = await apiClient.get(`/analytics/reports/quotation?${params}`);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
