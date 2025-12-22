import apiClient from './apiClient';

export interface QuotationItem {
    description: string;
    longDescription?: string;
    quantity: number;
    unit: string;
    rate: number;
    taxRate: number;
    amount: number;
    isOptional?: boolean;
}

export interface QuotationPayload {
    subject: string;
    relatedType: 'lead' | 'deal' | 'company';
    relatedId: string;
    status: string;
    assignedTo?: string;
    toField?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    email?: string;
    phone?: string;
    date: string;
    openTill?: string;
    currency: string;
    items: QuotationItem[];
    subTotal: number;
    taxTotal: number;
    discountType: string;
    discountValue: number;
    adjustment: number;
    total: number;
    terms?: string;
    comments?: string;
    companyId?: number;
}

export const quotationsService = {
    getAll: async (params?: any) => {
        return apiClient.get('/quotations', { params });
    },

    getById: async (id: string | number) => {
        return apiClient.get(`/quotations/${id}`);
    },

    create: async (data: QuotationPayload) => {
        return apiClient.post('/quotations', data);
    },

    update: async (id: string | number, data: Partial<QuotationPayload>) => {
        return apiClient.put(`/quotations/${id}`, data); // or patch
    },

    delete: async (id: string | number) => {
        return apiClient.delete(`/quotations/${id}`);
    },

    getNextNumber: async () => {
        return apiClient.get('/quotations/next-number');
    }
};
