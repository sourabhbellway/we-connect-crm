export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  lastLogin?: string;
  profilePicture?: string;
  mustChangePassword?: boolean;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  key: string;
  module: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenExpiry: string;
    user: User;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User & { requiresEmailVerification?: boolean };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenExpiry: string;
  };
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  passwordRequirements: PasswordRequirements | null;
  passwordChangeRequired?: boolean;
}
