import apiClient from "./apiClient";

export interface LeadSource {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const leadSourceService = {
  getLeadSources: async (): Promise<LeadSource[]> => {
    const response = await apiClient.get("/lead-sources");
    return response.data;
  },

  createLeadSource: async (
    sourceData: Partial<LeadSource>
  ): Promise<LeadSource> => {
    const response = await apiClient.post("/lead-sources", sourceData);
    return response.data;
  },

  updateLeadSource: async (
    id: number,
    sourceData: Partial<LeadSource>
  ): Promise<LeadSource> => {
    const response = await apiClient.put(`/lead-sources/${id}`, sourceData);
    return response.data;
  },

  deleteLeadSource: async (id: number): Promise<void> => {
    await apiClient.delete(`/lead-sources/${id}`);
  },
};
