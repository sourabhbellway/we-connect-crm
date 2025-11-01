import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';
import { API_BASE_URL } from '../config/config';
import { parseJwt } from '../utils/activityUtils';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token and handle authentication
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userId = localStorage.getItem('userId'); // Keep existing key for compatibility

    // Allow certain endpoints without token
    const publicEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.REFRESH,
      API_ENDPOINTS.HEALTH,
      '/api/auth/refresh-token',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint.replace('/api', ''))
    );

    if (token && !isPublicEndpoint) {
      try {
        const payload = parseJwt(token);
        
        // Validate token user matches stored user
        if (payload && payload.userId !== Number(userId)) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem('tokenExpiry'); // Keep existing key for compatibility
          
          window.dispatchEvent(
            new CustomEvent('tokenExpired', {
              detail: {
                title: 'Invalid Session',
                message: "Token doesn't match. Please log in again.",
              },
            })
          );
          
          return Promise.reject(new Error('Token user mismatch'));
        }

        // Add token to headers
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem('tokenExpiry');
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token expiry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem('tokenExpiry'); // Keep existing key for compatibility
      
      // Check if it's a token expiry error
      if (
        error.response?.data?.tokenExpired || 
        error.response?.data?.code === 'TOKEN_EXPIRED'
      ) {
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error or server not responding');
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// Enhanced request methods with better error handling
export const apiRequest = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;