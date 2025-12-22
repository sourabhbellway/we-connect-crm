import apiClient from './apiClient';

export interface DashboardSettings {
  salesPipelineFlow: string;
  performanceScorecard: string;
  dealVelocityVolume: string;
  topPerformersMonth: string;
}

class BusinessSettingsService {
  async getDashboardSettings(): Promise<{ success: boolean; data: DashboardSettings }> {
    const response = await apiClient.get('/business-settings/dashboard');
    return response.data;
  }

  async updateDashboardSettings(settings: Partial<DashboardSettings>): Promise<{ success: boolean; data: DashboardSettings }> {
    const response = await apiClient.put('/business-settings/dashboard', settings);
    return response.data;
  }
}

export const businessSettingsService = new BusinessSettingsService();
export default businessSettingsService;