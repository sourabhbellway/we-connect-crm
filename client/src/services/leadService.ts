import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants";

// Helper function for exponential backoff retry
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  sourceId?: number;
  status:
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed"
  | "lost"
  | "converted";
  notes?: string;
  assignedTo?: number;
  isActive: boolean;
  leadScore?: number;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags?: Array<{ id: number; name: string; color: string }>;
  source?: {
    id: number;
    name: string;
    description?: string;
  };
  // Additional fields
  website?: string;
  industry?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  companySize?: number;
  annualRevenue?: number | string;
  timezone?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  budget?: number | string;
  currency?: string;
  preferredContactMethod?: string;
  linkedinProfile?: string;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
}

// Payload used by create/update endpoints. Backend expects tag IDs (number[]) not tag objects.
export interface LeadPayload {
  // Basic Information
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Company Information
  company?: string;
  position?: string;
  industry?: string;
  website?: string;
  companySize?: number;
  annualRevenue?: number;

  // Location Information
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;

  // Contact & Social
  linkedinProfile?: string;
  timezone?: string;
  preferredContactMethod?: "email" | "phone" | "sms" | "whatsapp" | "linkedin";

  // Lead Management
  sourceId?: number;
  status?:
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "closed"
  | "lost"
  | "converted";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: number;

  // Business Information
  budget?: number;
  currency?: string;
  leadScore?: number;

  // Notes and Tags
  notes?: string;
  tags?: number[];

  // Timestamps
  lastContactedAt?: string;
  nextFollowUpAt?: string;

  // Custom Fields
  customFields?: Record<string, any>;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  negotiation: number;
  closed: number;
  lost: number;
}

export interface DashboardKPIs {
  revenue: {
    total: number;
    avgDealSize: number;
    mrr: number;
    wonDeals: number;
    lostDeals: number;
    activeDeals: number;
    revenueBySource: Array<{
      source: string;
      revenue: number;
      leadCount: number;
    }>;
    currency?: {
      code: string;
      symbol: string;
    };
  };
  conversion: {
    conversionRate: number;
    winRate: number;
    totalLeads: number;
    convertedLeads: number;
    avgSalesCycleDays: number;
    avgResponseTimeHours: number;
  };
  activity: {
    totalCalls: number;
    totalTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
  };
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  email?: string;
  assignedTo?: number;
}

export interface ConversionData {
  createContact: boolean;
  createCompany: boolean;
  createDeal: boolean;
  contactData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    address?: string;
    website?: string;
    notes?: string;
  };
  companyData: {
    name?: string;
    domain?: string;
    slug?: string;
    industryId?: number;
  };
  dealData: {
    title?: string;
    description?: string;
    value?: number;
    currency?: string;
    status?: string;
    probability?: number;
    expectedCloseDate?: string;
  };
}

export const leadService = {
  getLeads: async (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.email) params.append("email", filters.email);
    if (typeof filters.assignedTo === 'number') params.append('assignedTo', String(filters.assignedTo));
    if (filters.search && filters.search.toString().trim() !== "") {
      params.append("search", filters.search.toString().trim());
    }

    const response = await apiClient.get(`${API_ENDPOINTS.LEADS.BASE}?${params.toString()}`);
    return response.data;
  },

  getLeadById: async (id: number) => {
    const response = await apiClient.get(`${API_ENDPOINTS.LEADS.BASE}/${id}`);
    return response.data;
  },

  createLead: async (leadData: LeadPayload) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.post("/leads", leadData);
      return response.data;
    });
  },

  updateLead: async (id: number, leadData: LeadPayload) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/leads/${id}`, leadData);
        return response.data;
      } catch (error: any) {
        console.error("Lead update error:", {
          id,
          data: leadData,
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors,
        });
        throw error;
      }
    });
  },

  // Convenience method for assigning/transferring lead to a user
  assignLead: async (id: number, userId: number | null) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/leads/${id}`, { assignedTo: userId ?? null });
        return response.data;
      } catch (error: any) {
        console.error("Lead assign error:", { id, userId, status: error.response?.status, message: error.response?.data?.message });
        throw error;
      }
    });
  },

  // Transfer lead to another user with notes
  transferLead: async (id: number, newUserId: number | null, notes?: string) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/leads/${id}/transfer`, {
          newUserId: newUserId ?? null,
          notes: notes || ''
        });
        return response.data;
      } catch (error: any) {
        console.error("Lead transfer error:", { id, newUserId, status: error.response?.status, message: error.response?.data?.message });
        throw error;
      }
    });
  },

  // Bulk assign leads to a user
  bulkAssignLeads: async (leadIds: number[], newUserId: number | null) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put('/leads/bulk/assign', {
          leadIds,
          newUserId: newUserId ?? null
        });
        return response.data;
      } catch (error: any) {
        console.error("Bulk assign leads error:", { leadIds, newUserId, status: error.response?.status, message: error.response?.data?.message });
        throw error;
      }
    });
  },

  // Quick status update method
  updateLeadStatus: async (id: number, status: string) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/leads/${id}`, { status });
        return response.data;
      } catch (error: any) {
        console.error("Lead status update error:", { id, status, httpStatus: error.response?.status, message: error.response?.data?.message });
        throw error;
      }
    });
  },

  deleteLead: async (id: number) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.delete(`/leads/${id}`);
      return response.data;
    });
  },

  getLeadStats: async () => {
    const response = await apiClient.get("/leads/stats");
    return response.data;
  },

  getDashboardKPIs: async (startDate?: string, endDate?: string, userId?: number, scope: 'all' | 'me' = 'all') => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (typeof userId === 'number') params.append('userId', String(userId));
    params.append('scope', scope);

    const response = await apiClient.get(`/analytics/dashboard/kpis?${params.toString()}`);
    return response.data;
  },

  // Convert lead to contact, company, and/or deal
  convertLead: async (id: number, conversionData: ConversionData) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.post(`/leads/${id}/convert`, conversionData);
        return response.data;
      } catch (error: any) {
        console.error("Lead conversion error:", {
          id,
          data: conversionData,
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors,
        });
        throw error;
      }
    });
  },

  // Force conversion (server may allow re-convert via query flag)
  convertLeadForce: async (id: number, conversionData: ConversionData) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.post(`/leads/${id}/convert?force=true`, conversionData);
        return response.data;
      } catch (error: any) {
        console.error("Lead conversion (force) error:", {
          id,
          data: conversionData,
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors,
        });
        throw error;
      }
    });
  },

  // Undo lead conversion - revert a converted lead back to its previous status
  undoConversion: async (leadId: number) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.post(`/leads/${leadId}/undo-conversion`);
        return response.data;
      } catch (error: any) {
        console.error("Undo conversion error:", {
          leadId,
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  },

  // Get deleted leads
  getDeletedLeads: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    params.append("isDeleted", "true");
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await apiClient.get(`${API_ENDPOINTS.LEADS.BASE}?${params.toString()}`);
    return response.data;
  },

  // Restore a deleted lead
  restoreLead: async (id: number) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/leads/${id}/restore`);
        return response.data;
      } catch (error: any) {
        console.error("Lead restore error:", {
          id,
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  },

  // Permanently delete a trashed lead
  deleteLeadPermanently: async (id: number) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.delete(`/leads/${id}/permanent`);
        return response.data;
      } catch (error: any) {
        console.error("Lead permanent delete error:", {
          id,
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  },
};
