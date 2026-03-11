import { apiRequest } from "./apiClient";

export interface Tax {
  id: number;
  name: string;
  rate: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxPayload {
  name: string;
  rate: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTaxPayload {
  name?: string;
  rate?: number;
  description?: string;
  isActive?: boolean;
}

export const taxesService = {
  getAll: async (): Promise<Tax[]> => {
    const response = await apiRequest.get<any>("/taxes");
    return Array.isArray(response) ? response : response?.data || [];
  },

  getById: async (id: number): Promise<Tax> => {
    const response = await apiRequest.get<any>(`/taxes/${id}`);
    return response?.data?.tax || response?.data || response;
  },

  create: async (data: CreateTaxPayload): Promise<Tax> => {
    const response = await apiRequest.post<any>("/taxes", data);
    return response?.data?.tax || response?.data || response;
  },

  update: async (id: number, data: UpdateTaxPayload): Promise<Tax> => {
    const response = await apiRequest.patch<any>(`/taxes/${id}`, data);
    return response?.data?.tax || response?.data || response;
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest.delete(`/taxes/${id}`);
  },
};
