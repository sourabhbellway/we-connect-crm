import apiClient from './apiClient';

export interface Meeting {
  id: number;
  leadId: number;
  userId: number;
  type: string;
  subject?: string;
  content: string;
  direction: string;
  duration?: number;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateMeetingDto {
  leadId: number;
  userId: number;
  type: 'MEETING';
  subject?: string;
  content: string;
  direction?: string;
  duration?: number;
  outcome?: string;
  scheduledAt: string;
  completedAt?: string;
}

export const communicationService = {
  getMeetings: async (leadId: number): Promise<{ success: boolean; data: { items: Meeting[] } }> => {
    const response = await apiClient.get(`/communications/leads/${leadId}/meetings`);
    return response.data;
  },

  createMeeting: async (dto: CreateMeetingDto): Promise<{ success: boolean; data: { communication: Meeting } }> => {
    const response = await apiClient.post('/communications/leads', dto);
    return response.data;
  },

  getCommunications: async (leadId: number): Promise<{ success: boolean; data: { items: Meeting[] } }> => {
    const response = await apiClient.get(`/communications/leads?leadId=${leadId}`);
    return response.data;
  },
};

