import apiClient from './apiClient';

export interface VoipConfiguration {
  id: number;
  provider: string;
  name: string;
  country: string;
  fromNumber?: string;
  webhookUrl?: string;
  recordingEnabled: boolean;
  voicemailEnabled: boolean;
  clickToCallEnabled: boolean;
  isActive: boolean;
  isDefault: boolean;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface VoipProvider {
  id: string;
  name: string;
  description: string;
  supportedCountries: string[];
  features: string[];
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }>;
}

export interface CallLog {
  id: number;
  voipConfigId?: number;
  callSid?: string;
  fromNumber: string;
  toNumber: string;
  direction: string;
  status: string;
  duration: number;
  recordingUrl?: string;
  startTime?: string;
  endTime?: string;
  userId?: number;
  leadId?: number;
  dealId?: number;
  notes?: string;
  metadata?: any;
  createdAt: string;
}

class VoipService {
  // Get all VoIP configurations
  async getConfigurations() {
    const response = await apiClient.get('/voip/configurations');
    return response.data;
  }

  // Get single VoIP configuration
  async getConfiguration(id: number) {
    const response = await apiClient.get(`/voip/configurations/${id}`);
    return response.data;
  }

  // Create VoIP configuration
  async createConfiguration(data: Partial<VoipConfiguration>) {
    const response = await apiClient.post('/voip/configurations', data);
    return response.data;
  }

  // Update VoIP configuration
  async updateConfiguration(id: number, data: Partial<VoipConfiguration>) {
    const response = await apiClient.put(`/voip/configurations/${id}`, data);
    return response.data;
  }

  // Delete VoIP configuration
  async deleteConfiguration(id: number) {
    const response = await apiClient.delete(`/voip/configurations/${id}`);
    return response.data;
  }

  // Test VoIP configuration
  async testConfiguration(id: number) {
    const response = await apiClient.post(`/voip/configurations/${id}/test`);
    return response.data;
  }

  // Get available providers
  async getProviders() {
    const response = await apiClient.get('/voip/providers');
    return response.data;
  }

  // Make a call
  async makeCall(data: {
    toNumber: string;
    fromNumber: string;
    voipConfigId: number;
    userId?: number;
    leadId?: number;
    dealId?: number;
  }) {
    const response = await apiClient.post('/voip/call', data);
    return response.data;
  }

  // Get call logs
  async getCallLogs(filters?: {
    userId?: number;
    leadId?: number;
    dealId?: number;
  }) {
    const response = await apiClient.get('/voip/call-logs', { params: filters });
    return response.data;
  }
}

export default new VoipService();