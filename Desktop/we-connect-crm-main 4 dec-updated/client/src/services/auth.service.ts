import axios, { AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenResponse,
  User,
  PasswordRequirements,
} from '../types/auth';
import { STORAGE_KEYS } from '../constants';
import { API_BASE_URL as API_ROOT } from '../config/config';

const API_BASE_URL = `${API_ROOT}/auth`;

class AuthService {
  constructor() {}

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeadersWithToken() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      ...this.getAuthHeaders(),
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${API_BASE_URL}/login`,
        credentials,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.data.success) {
        const { accessToken, refreshToken, user, tokenExpiry } = response.data.data;
        
        // Store tokens securely
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem('tokenExpiry', tokenExpiry);
        localStorage.setItem('userId', user.id.toString()); // Store userId for token validation
        
        // Set default authorization header for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await axios.post(
        `${API_BASE_URL}/register`,
        userData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
        `${API_BASE_URL}/forgot-password`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
        `${API_BASE_URL}/reset-password`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw this.handleAuthError(error);
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<RefreshTokenResponse> = await axios.post(
        `${API_BASE_URL}/refresh-token`,
        { refreshToken },
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.data.success) {
        const { accessToken, tokenExpiry } = response.data.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        localStorage.setItem('tokenExpiry', tokenExpiry);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }

      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear all tokens
      this.clearTokens();
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          headers: this.getAuthHeadersWithToken(),
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      delete axios.defaults.headers.common['Authorization'];
    }

    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: this.getAuthHeadersWithToken(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw this.handleAuthError(error);
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/verify-email/${token}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  async getPermissionsForRole(roleId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/roles/${roleId}/permissions`,
        {
          headers: this.getAuthHeadersWithToken(),
        }
      );
      return response.data.data.permissions;
    } catch (error: any) {
      console.error('Get permissions error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Password validation utilities
  validatePassword(password: string, requirements?: PasswordRequirements): { isValid: boolean; errors: string[] } {
    const reqs = requirements || {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
    };

    const errors: string[] = [];

    if (password.length < reqs.minLength) {
      errors.push(`Password must be at least ${reqs.minLength} characters long`);
    }

    if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (reqs.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (reqs.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (reqs.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  calculatePasswordStrength(password: string): { score: number; message: string; color: string } {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longPassword: password.length >= 12,
    };

    Object.values(checks).forEach((passed) => {
      if (passed) score += 1;
    });

    if (score <= 2) {
      return { score, message: 'Weak', color: 'red' };
    } else if (score <= 4) {
      return { score, message: 'Fair', color: 'orange' };
    } else if (score <= 5) {
      return { score, message: 'Good', color: 'yellow' };
    } else {
      return { score, message: 'Strong', color: 'green' };
    }
  }

  // Token management utilities
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return new Date(expiry) <= new Date();
  }

  async ensureValidToken(): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    if (this.isTokenExpired()) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userId');
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired());
  }

  private handleAuthError(error: any): Error {
    const message = error.response?.data?.message || 'Authentication error occurred';
    const status = error.response?.status;

    // Map 403 Forbidden to a clear blocked/deactivated message for login attempts
    if (status === 403) {
      return new Error(message || 'Your login is blocked please contact your administrator');
    }

    if (status === 423) {
      return new Error('Account is temporarily locked. Please try again later.');
    } else if (status === 429) {
      return new Error('Too many attempts. Please wait before trying again.');
    } else if (status === 401 && error.response?.data?.requiresEmailVerification) {
      return new Error('Please verify your email address before logging in.');
    }

    return new Error(message);
  }

  // Auto-login functionality
  async autoLogin(): Promise<boolean> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return false;

      if (this.isTokenExpired()) {
        const refreshSuccess = await this.ensureValidToken();
        if (!refreshSuccess) return false;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`;
      await this.getProfile();
      return true;
    } catch (error) {
      console.error('Auto-login failed:', error);
      this.clearTokens();
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
