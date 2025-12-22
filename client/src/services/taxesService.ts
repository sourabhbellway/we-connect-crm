import { apiRequest } from './apiClient';

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
        return apiRequest.get<Tax[]>('/taxes');
    },

    getById: async (id: number): Promise<Tax> => {
        return apiRequest.get<Tax>(`/taxes/${id}`);
    },

    create: async (data: CreateTaxPayload): Promise<Tax> => {
        return apiRequest.post<Tax>('/taxes', data);
    },

    update: async (id: number, data: UpdateTaxPayload): Promise<Tax> => {
        return apiRequest.patch<Tax>(`/taxes/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest.delete(`/taxes/${id}`);
    },
};
