import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface Deal {
  id: number;
  title: string;
  description?: string;
  value: number;
  currency: string;
  status: string;
  probability: number;
  expectedCloseDate?: string;
  assignedTo?: number;
  contactId?: number;
  leadId?: number;
  companyId?: number;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  contact?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  lead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  companies?: {
    id: number;
    name: string;
  };
  stage?: string;
  priority?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealsResponse {
  success: boolean;
  data: {
    deals: Deal[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface DealResponse {
  success: boolean;
  data: Deal;
  message?: string;
}

class DealService {
  async getDeals(page: number = 1, limit: number = 10, search?: string): Promise<DealsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiClient.get(`${API_ENDPOINTS.DEALS.BASE}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async getDealById(id: number): Promise<DealResponse> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.DEALS.BASE}/${id}`);
      const raw = response.data;
      const deal = raw?.data?.deal || raw?.data || raw;
      return { success: raw?.success ?? true, data: deal, message: raw?.message } as DealResponse;
    } catch (error) {
      console.error('Error fetching deal:', error);
      throw error;
    }
  }

  async createDeal(dealData: Partial<Deal>): Promise<DealResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.DEALS.BASE, dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(id: number, dealData: Partial<Deal>): Promise<DealResponse> {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.DEALS.BASE}/${id}`, dealData);
      return response.data;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  async deleteDeal(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.DEALS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  async getDeal(id: number): Promise<DealResponse> {
    return this.getDealById(id);
  }

  async getDealStats(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DEALS.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching deal stats:', error);
      throw error;
    }
  }

  async bulkExportDeals(search?: string): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await apiClient.get(`${API_ENDPOINTS.DEALS.BASE}/bulk/export?${params.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting deals:', error);
      throw error;
    }
  }

  async bulkImportDeals(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await apiClient.post(`${API_ENDPOINTS.DEALS.BASE}/bulk/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing deals:', error);
      throw error;
    }
  }

  async bulkAssignDeals(dealIds: number[], userId: number | null): Promise<any> {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.DEALS.BASE}/bulk/assign`, { dealIds, userId });
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning deals:', error);
      throw error;
    }
  }
}

export const dealService = new DealService();
