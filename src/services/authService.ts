import axios from "axios";
import { LoginRequest, LoginResponse } from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method,
    });

    if (error.response?.status === 401) {
      // Clear token but don't auto-redirect - let the app handle it
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    // For now, just return success since we handle logout on frontend
    return { success: true, message: "Logged out successfully" };
  },
};

export default apiClient;
