import { apiRequest } from './apiClient';

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
        return apiRequest.get<Currency[]>('/currencies');
    },

    getById: async (id: number): Promise<Currency> => {
        return apiRequest.get<Currency>(`/currencies/${id}`);
    },

    create: async (data: CreateCurrencyPayload): Promise<Currency> => {
        return apiRequest.post<Currency>('/currencies', data);
    },

    update: async (id: number, data: UpdateCurrencyPayload): Promise<Currency> => {
        return apiRequest.patch<Currency>(`/currencies/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return apiRequest.delete(`/currencies/${id}`);
    },
};
