import apiClient from './apiClient';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string; // ISO
  assignedTo?: number | null;
  createdBy: number;
  leadId?: number | null;
  dealId?: number | null;
  contactId?: number | null;
  // Back-compat
  entityType?: 'lead' | 'deal' | 'contact';
  entityId?: number;
}

export const tasksService = {
  list: async (params: {
    page?: number;
    limit?: number;
    status?: string; // can be CSV
    search?: string;
    entityType?: 'lead' | 'deal' | 'contact';
    entityId?: number | string;
    leadId?: number;
    dealId?: number;
    contactId?: number;
    assignedTo?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.status) qs.append('status', params.status);
    if (params.search) qs.append('search', params.search);
    if (params.entityType && params.entityId) {
      qs.append('entityType', params.entityType);
      qs.append('entityId', String(params.entityId));
    }
    if (params.leadId) qs.append('leadId', String(params.leadId));
    if (params.dealId) qs.append('dealId', String(params.dealId));
    if (params.contactId) qs.append('contactId', String(params.contactId));
    if (params.assignedTo) qs.append('assignedTo', String(params.assignedTo));

    const url = `/tasks?${qs.toString()}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  get: async (id: number) => {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data;
  },

  create: async (payload: TaskPayload) => {
    const res = await apiClient.post(`/tasks`, payload);
    return res.data;
  },

  update: async (id: number, payload: Partial<TaskPayload>) => {
    const res = await apiClient.put(`/tasks/${id}`, payload);
    return res.data;
  },

  complete: async (id: number) => {
    const res = await apiClient.put(`/tasks/${id}/complete`);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await apiClient.delete(`/tasks/${id}`);
    return res.data;
  },
};
