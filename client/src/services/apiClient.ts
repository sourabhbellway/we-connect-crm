import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';
import { API_BASE_URL } from '../config/config';
import { parseJwt } from '../utils/activityUtils';
import { notifyGlobalLoaderStart, notifyGlobalLoaderStop } from '../contexts/LoaderContext';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

const shouldSkipGlobalLoader = (config?: AxiosRequestConfig) => {
  const skipHeader = (config?.headers as Record<string, unknown>)?.['X-Skip-Global-Loader'];
  return skipHeader === true || skipHeader === 'true' || (config as any)?.skipGlobalLoader === true;
};

const markLoaderStarted = (config: AxiosRequestConfig) => {
  if (shouldSkipGlobalLoader(config)) {
    return config;
  }
  notifyGlobalLoaderStart();
  (config as any).__globalLoaderActive = true;
  return config;
};

const markLoaderFinished = (config?: AxiosRequestConfig) => {
  if (!config) return;
  if ((config as any).__globalLoaderActive) {
    notifyGlobalLoaderStop();
    (config as any).__globalLoaderActive = false;
  }
};

// Request interceptor to add auth token and handle authentication
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    markLoaderStarted(config);

    // Support both legacy and new token keys for compatibility
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      localStorage.getItem('token');

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
        // Optionally validate that this looks like a JWT; we no longer enforce a
        // strict local userId match here, and instead rely on the backend to
        // reject invalid tokens with a 401.
        parseJwt(token);

        // Add token to headers
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    markLoaderFinished(error.config);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors and token expiry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    markLoaderFinished(response.config);
    return response;
  },
  (error) => {
    markLoaderFinished(error.config);
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

    // Handle 403 Forbidden - account blocked/deactivated
    if (error.response?.status === 403) {
      const code = error.response?.data?.code;
      const msg = (error.response?.data?.message || '').toString();
      // Prefer explicit machine-readable code from backend; fallback to message detection
      if (code === 'ACCOUNT_BLOCKED' || /blocked|deactivated|account is inactive|account is disabled/i.test(msg)) {
        // Clear auth tokens locally
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Emit a global event so the auth layer can react (logout UI, redirect)
        try {
          window.dispatchEvent(new CustomEvent('accountDeactivated', { detail: { message: msg, code } }));
        } catch (e) {
          // ignore
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error or server not responding');
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  },
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

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data, config);
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