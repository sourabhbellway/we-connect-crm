import apiClient from "./authService";

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
    | "lost";
  notes?: string;
  assignedTo?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags?: Array<{ id: number; name: string; color: string }>;
}

// Payload used by create/update endpoints. Backend expects tag IDs (number[]) not tag objects.
export interface LeadPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  sourceId?: number;
  status?:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed"
    | "lost";
  notes?: string;
  assignedTo?: number;
  tags?: number[];
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

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const leadService = {
  getLeads: async (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);

    const response = await apiClient.get(`/leads?${params.toString()}`);
    return response.data;
  },

  getLeadById: async (id: number) => {
    const response = await apiClient.get(`/leads/${id}`);
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
};
