import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { STORAGE_KEYS } from "../constants";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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

  // Get deleted data (users, leads, roles)
  getDeletedData: async (page = 1, limit = 10) => {
    try {
      const response = await createAuthInstance().get(
        `/activities/deleted-data?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching deleted data:", error);
      throw error;
    }
  },

  // Get activities by lead ID
  getActivitiesByLeadId: async (leadId: number, page = 1, limit = 50) => {
    try {
      const response = await createAuthInstance().get(
        `/activities/lead/${leadId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      throw error;
    }
  },
};
