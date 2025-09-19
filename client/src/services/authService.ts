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
    // Check if user is authenticated before making API calls
    const token = localStorage.getItem("token");
    // const currentPath = window.location.pathname;
    
    // // Allow login and health check without token
    // const allowedPaths = ['/auth/login', '/auth/register', '/health'];
    // const isAllowedPath = allowedPaths.some(path => config.url?.includes(path));
    
    // if (!token && !isAllowedPath && currentPath !== '/login') {
    //   // Redirect to login if no token and not on login page
    //   window.location.href = '/login';
    //   return Promise.reject(new Error('No authentication token'));
    // }
    
    const userid = localStorage.getItem("userId")
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.userId !== Number(userid)) {
        // Token user does not match stored user; clear and notify UI
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        window.dispatchEvent(
          new CustomEvent('tokenExpired', {
            detail: {
              title: 'Invalid Session',
              message: "Token doesn't match. We're redirecting you to the login screen. Please log in again.",
            },
          })
        );
        return Promise.reject(new Error('Token user mismatch'));
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
      // Clear token and trigger token expiry modal
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      
      // Check if it's a token expiry error
      if (error.response?.data?.tokenExpired || error.response?.data?.code === 'TOKEN_EXPIRED') {
        // Dispatch custom event for token expiry
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
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
