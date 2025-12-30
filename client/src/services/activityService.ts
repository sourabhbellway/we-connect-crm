import apiClient from "./apiClient";

export const activityService = {
  // Get all activities with pagination and filters
  getActivities: async (page = 1, limit = 10, filters?: { type?: string; userId?: number }) => {
    try {
      const response = await apiClient.get("/activities", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  // Get recent activities for dashboard
  getRecentActivities: async (limit = 5, userId?: number) => {
    try {
      const params: any = { limit };
      if (userId) params.userId = userId;

      const response = await apiClient.get("/activities/recent", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },

  // Get activity statistics
  getActivityStats: async () => {
    try {
      const response = await apiClient.get("/activities/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      throw error;
    }
  },

  // Create a new activity
  createActivity: async (activityData: {
    title: string;
    description: string;
    type: string;
    icon?: string;
    iconColor?: string;
    tags?: string[];
    metadata?: any;
    userId?: number;
  }) => {
    try {
      const response = await apiClient.post("/activities", activityData);
      return response.data;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },

  // Get deleted data (users, leads, roles)
  getDeletedData: async (page = 1, limit = 10, options?: { skipLoader?: boolean }) => {
    try {
      const response = await apiClient.get("/activities/deleted-data", {
        params: { page, limit },
        ...(options?.skipLoader
          ? {
            headers: { 'X-Skip-Global-Loader': 'true' },
            skipGlobalLoader: true as any,
          }
          : {}),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching deleted data:", error);
      throw error;
    }
  },

  // Get activities by lead ID
  getActivitiesByLeadId: async (leadId: number, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`/activities/lead/${leadId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      throw error;
    }
  },
};
