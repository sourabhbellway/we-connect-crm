import { apiRequest } from "./apiClient";

export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyPayload {
  name: string;
  code: string;
  symbol: string;
  exchangeRate?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateCurrencyPayload {
  name?: string;
  code?: string;
  symbol?: string;
  exchangeRate?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export const currenciesService = {
  getAll: async (): Promise<Currency[]> => {
    const response = await apiRequest.get<any>("/currencies");
    return Array.isArray(response) ? response : response?.data || [];
  },

  getById: async (id: number): Promise<Currency> => {
    const response = await apiRequest.get<any>(`/currencies/${id}`);
    return response?.data?.currency || response?.data || response;
  },

  create: async (data: CreateCurrencyPayload): Promise<Currency> => {
    const response = await apiRequest.post<any>("/currencies", data);
    return response?.data?.currency || response?.data || response;
  },

  update: async (id: number, data: UpdateCurrencyPayload): Promise<Currency> => {
    const response = await apiRequest.patch<any>(`/currencies/${id}`, data);
    return response?.data?.currency || response?.data || response;
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest.delete(`/currencies/${id}`);
  },
};
