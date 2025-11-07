import apiClient from './apiClient';

export type ExpenseType = 
  | 'TRAVEL' 
  | 'MEALS' 
  | 'ACCOMMODATION' 
  | 'OFFICE_SUPPLIES' 
  | 'UTILITIES' 
  | 'MARKETING' 
  | 'ENTERTAINMENT' 
  | 'TRAINING' 
  | 'EQUIPMENT' 
  | 'SOFTWARE' 
  | 'CONSULTING' 
  | 'MISCELLANEOUS' 
  | 'OTHER';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface ExpensePayload {
  expenseDate: string;
  amount: number;
  type: ExpenseType;
  description?: string;
  remarks?: string;
  receiptUrl?: string;
  submittedBy: number;
  projectId?: number;
  dealId?: number;
  leadId?: number;
  currency?: string;
}

export interface ApproveExpensePayload {
  status: 'APPROVED' | 'REJECTED';
  reviewedBy: number;
  approvalRemarks?: string;
}

export const expenseService = {
  list: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    submittedBy?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    projectId?: number;
    dealId?: number;
    leadId?: number;
    currency?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.status) qs.append('status', params.status);
    if (params.search) qs.append('search', params.search);
    if (params.submittedBy) qs.append('submittedBy', String(params.submittedBy));
    if (params.startDate) qs.append('startDate', params.startDate);
    if (params.endDate) qs.append('endDate', params.endDate);
    if (params.type) qs.append('type', params.type);
    if (params.projectId) qs.append('projectId', String(params.projectId));
    if (params.dealId) qs.append('dealId', String(params.dealId));
    if (params.leadId) qs.append('leadId', String(params.leadId));
    if (params.currency) qs.append('currency', params.currency);

    const url = `/expenses?${qs.toString()}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  get: async (id: number) => {
    const res = await apiClient.get(`/expenses/${id}`);
    return res.data;
  },

  create: async (payload: ExpensePayload) => {
    const res = await apiClient.post(`/expenses`, payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<ExpensePayload>) => {
    const res = await apiClient.put(`/expenses/${id}`, payload);
    return res.data;
  },

  approve: async (id: number, payload: ApproveExpensePayload) => {
    const res = await apiClient.put(`/expenses/${id}/approve`, payload);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await apiClient.delete(`/expenses/${id}`);
    return res.data;
  },

  getStats: async (userId?: number) => {
    const qs = new URLSearchParams();
    if (userId) qs.append('userId', String(userId));
    const url = `/expenses/stats${qs.toString() ? `?${qs.toString()}` : ''}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  uploadReceipt: async (expenseId: number, file: File, name?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'expense');
    formData.append('entityId', String(expenseId));
    if (name) formData.append('name', name);

    const res = await apiClient.post(`/files/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

