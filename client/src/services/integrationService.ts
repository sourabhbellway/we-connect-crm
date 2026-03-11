import { apiRequest } from "./apiClient";

export interface ThirdPartyIntegration {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  apiEndpoint: string | null;
  authType: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export const integrationService = {
  baseUrl: "/integrations",

  async list(): Promise<{ success: boolean; data: { items: ThirdPartyIntegration[] } }> {
    return apiRequest.get(this.baseUrl);
  },

  async getActiveIntegrations(): Promise<ThirdPartyIntegration[]> {
    try {
      const response = await this.list();
      if (response.success && response.data?.items) {
        return response.data.items.filter((item) => item.isActive);
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch integrations", error);
      return [];
    }
  },
};
