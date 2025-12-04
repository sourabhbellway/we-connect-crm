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
    // Prefer the unified auth token key used across the app
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    const userid = localStorage.getItem("userId");

    if (token) {
      try {
        const payload = parseJwt(token);

        // If we have both payload.userId and stored userId, and they clearly don't match,
        // treat it as a sign of stale storage. Instead of hard failing, clear and allow
        // the auth flow to re-establish a fresh session on next login.
        if (
          payload &&
          payload.userId !== undefined &&
          userid !== null &&
          payload.userId !== Number(userid)
        ) {
          console.warn('[AuthService] Detected token/userId mismatch in localStorage; clearing stale auth state');
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("tokenExpiry");
          localStorage.removeItem("userId");

          // Do NOT dispatch a blocking global modal here; simply reject so the
          // next navigation or login can restore a consistent state.
          return Promise.reject(new Error('Token user mismatch - cleared stale auth'));
        }

        // Attach Authorization header for valid token
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('[AuthService] Failed to parse JWT, clearing token', err);
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiry");
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
    try {
      const response = await apiClient.post("/auth/login", credentials);
      console.log("Login Response:", response.data);
      
      // Check if login was successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid credentials');
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Login Error:", error);
      
      // Handle axios error response
      if (error.response?.data) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Login failed';
        throw new Error(errorMessage);
      }
      
      // Handle network or other errors
      throw new Error(error.message || 'Login failed. Please check your connection.');
    }
  },

  
  

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  getPermissionsForRole: async (roleId: string) => {
    // Backend exposes role permissions under /roles/:id/permissions (without /auth prefix)
    const response = await apiClient.get(`/roles/${roleId}/permissions`);
    return response.data.data.permissions;
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
