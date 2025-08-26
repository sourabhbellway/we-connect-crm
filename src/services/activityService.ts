import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const activityService = {
  // Get all activities with pagination
  getActivities: async (page = 1, limit = 10) => {
    try {
      const response = await createAuthInstance().get(
        `/activities?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },

  // Get recent activities for dashboard
  getRecentActivities: async (limit = 5) => {
    try {
      const response = await createAuthInstance().get(
        `/activities/recent?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },

  // Get activity statistics
  getActivityStats: async () => {
    try {
      const response = await createAuthInstance().get("/activities/stats");
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
      const response = await createAuthInstance().post(
        "/activities",
        activityData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },
};
