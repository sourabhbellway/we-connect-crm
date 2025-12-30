import apiClient from "./apiClient";

export interface CallLog {
    id: number;
    leadId: number;
    userId: number;
    phoneNumber: string;
    callType: 'INBOUND' | 'OUTBOUND';
    callStatus: 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'CANCELLED';
    // duration?: number;
    startTime?: string;
    endTime?: string;
    notes?: string;
    outcome?: string;
    recordingUrl?: string;
    isAnswered: boolean;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
    };
    lead?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export const callLogService = {
    // Get all call logs with pagination
    getCallLogs: async (params: { leadId?: number; userId?: number; page?: number; limit?: number } = {}) => {
        try {
            const response = await apiClient.get("/call-logs", {
                params: {
                    ...params,
                    page: params.page || 1,
                    limit: params.limit || 10,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching call logs:", error);
            throw error;
        }
    },

    // Get a single call log by ID
    getCallLogById: async (id: number) => {
        try {
            const response = await apiClient.get(`/call-logs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching call log ${id}:`, error);
            throw error;
        }
    },

    // Create a new call log
    createCallLog: async (data: Partial<CallLog>) => {
        try {
            const response = await apiClient.post("/call-logs", data);
            return response.data;
        } catch (error) {
            console.error("Error creating call log:", error);
            throw error;
        }
    },

    // Update an existing call log
    updateCallLog: async (id: number, data: Partial<CallLog>) => {
        try {
            const response = await apiClient.put(`/call-logs/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating call log ${id}:`, error);
            throw error;
        }
    },

    // Delete a call log
    deleteCallLog: async (id: number) => {
        try {
            const response = await apiClient.delete(`/call-logs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting call log ${id}:`, error);
            throw error;
        }
    },

    // Initiate a call (if applicable)
    initiateCall: async (data: Partial<CallLog> & { deviceToken?: string }) => {
        try {
            const response = await apiClient.post("/call-logs/initiate", data);
            return response.data;
        } catch (error) {
            console.error("Error initiating call:", error);
            throw error;
        }
    },
};
