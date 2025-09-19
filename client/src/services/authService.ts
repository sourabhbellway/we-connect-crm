import axios from "axios";
import { LoginRequest, LoginResponse } from "../types/auth";
import { API_BASE_URL } from "../config/config";
import { parseJwt } from "../utils/activityUtils";

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
    const userid = localStorage.getItem("userId")
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.userId !== Number(userid)) {
        console.log("Decoded username from JWT:", payload.username);
      }else{
        config.headers.Authorization = `Bearer ${token}`;
      }
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

  superAdminLogin: async (
    credentials: LoginRequest
  ): Promise<LoginResponse> => {
    const response = await apiClient.post(
      "/auth/super-admin/login",
      credentials
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  getPermissionsForRole: async (roleId: string) => {
    const response = await apiClient.get(`/auth/roles/${roleId}/permissions`);
    return response.data.data.permissions;
  },

  getSuperAdminProfile: async () => {
    const response = await apiClient.get("/auth/super-admin/profile");
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
