import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordRequirements
} from "../types/auth";
import { authService } from "../services/auth.service";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<any>;
  resetPassword: (data: ResetPasswordRequest) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  calculatePasswordStrength: (password: string) => { score: number; message: string; color: string };
  autoLogin: () => Promise<boolean>;
  clearError: () => void;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; accessToken: string; refreshToken: string; tokenExpiry: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS" }
  | { type: "REGISTER_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CHECK_AUTH_SUCCESS"; payload: User }
  | { type: "CHECK_AUTH_FAILURE" }
  | { type: "TOKEN_EXPIRED" }
  | { type: "TOKEN_REFRESHED"; payload: string }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_PASSWORD_REQUIREMENTS"; payload: PasswordRequirements };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  error: null,
  passwordRequirements: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    case "TOKEN_EXPIRED":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isBootstrapping: false,
        error: "Session expired. Please login again.",
      };
    case "TOKEN_REFRESHED":
      return {
        ...state,
        accessToken: action.payload,
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CHECK_AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isBootstrapping: false,
        error: null,
      };
    case "CHECK_AUTH_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isBootstrapping: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_PASSWORD_REQUIREMENTS":
      return {
        ...state,
        passwordRequirements: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const success = await authService.autoLogin();
        if (success) {
          const profileResponse = await authService.getProfile();
          dispatch({
            type: "CHECK_AUTH_SUCCESS",
            payload: profileResponse.data.user
          });
        } else {
          dispatch({ type: "CHECK_AUTH_FAILURE" });
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        dispatch({ type: "CHECK_AUTH_FAILURE" });
      }
    };

    initAuth();
  }, []);

  // Listen for global account deactivation events (emitted from apiClient)
  useEffect(() => {
    const handleAccountDeactivated = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      const message = custom?.detail?.message || 'Your account has been deactivated.';
      // Inform the user and force logout
      try {
        // Use toast to notify (toast imported lazily to avoid circular deps)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { toast } = require('react-toastify');
        toast.info(message, { toastId: 'account_deactivated' });
      } catch (e) {
        console.error('Failed to show deactivation toast', e);
      }
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('accountDeactivated', handleAccountDeactivated as EventListener);
    return () => {
      window.removeEventListener('accountDeactivated', handleAccountDeactivated as EventListener);
    };
  }, []);

  // Listen for role deactivation events - auto logout affected users
  useEffect(() => {
    const handleRoleDeactivated = (event: Event) => {
      const custom = event as CustomEvent<{ detail: { userIds: number[]; roleName: string; timestamp: string } }>;
      const { userIds, roleName } = custom?.detail || {};
      const currentUserId = state.user?.id;

      // Check if current user is in the affected users list
      if (userIds && currentUserId && userIds.includes(currentUserId)) {
        try {
          // Use toast to notify
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { toast } = require('react-toastify');
          toast.error(
            `Your role "${roleName}" has been deactivated. You are being logged out for security.`,
            { toastId: 'role_deactivated', autoClose: 5000 }
          );
        } catch (e) {
          console.error('Failed to show role deactivation toast', e);
        }

        // Force logout
        dispatch({ type: 'LOGOUT' });
      }
    };

    window.addEventListener('roleDeactivated', handleRoleDeactivated as EventListener);
    return () => {
      window.removeEventListener('roleDeactivated', handleRoleDeactivated as EventListener);
    };
  }, [state.user?.id]);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authService.login(credentials);

      // Check if response is successful
      if (!response.success) {
        const errorMessage = response.message || 'Invalid credentials';
        dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
        throw new Error(errorMessage);
      }

      // Store tokens in localStorage
      if (response.data) {
        const { accessToken, refreshToken, tokenExpiry, user } = response.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('tokenExpiry', tokenExpiry);
        localStorage.setItem('userId', user.id.toString());
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, accessToken, refreshToken, tokenExpiry },
        });
      }

      // Return the full response so callers can inspect mustChangePassword
      return response;
    } catch (error: any) {
      const message = error.message || error.response?.data?.message || "Login failed";
      console.error('Login error:', error);
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      dispatch({ type: "REGISTER_START" });
      const response = await authService.register(userData);
      dispatch({ type: "REGISTER_SUCCESS" });
      return response;
    } catch (error: any) {
      const message = error.message || "Registration failed";
      dispatch({ type: "REGISTER_FAILURE", payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      return await authService.forgotPassword(data);
    } catch (error: any) {
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      return await authService.resetPassword(data);
    } catch (error: any) {
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      return await authService.verifyEmail(token);
    } catch (error: any) {
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const profileResponse = await authService.getProfile();
      dispatch({
        type: "CHECK_AUTH_SUCCESS",
        payload: profileResponse.data.user
      });
    } catch (error) {
      dispatch({ type: "CHECK_AUTH_FAILURE" });
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user || !state.user.roles) return false;
    // Admin override: any Admin or Super Admin role grants access to all modules
    const isAdmin = state.user.roles.some((role) => {
      const name = (role.name || '').toLowerCase();
      return name === 'admin' || name === 'super_admin' || name === 'super admin';
    });
    if (isAdmin) return true;

    return state.user.roles.some((role) =>
      role.permissions.some((perm) => perm.key === permission)
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!state.user || !state.user.roles) return false;
    return state.user.roles.some((role) => role.name === roleName);
  };

  const validatePassword = (password: string) => {
    return authService.validatePassword(password, state.passwordRequirements || undefined);
  };

  const calculatePasswordStrength = (password: string) => {
    return authService.calculatePasswordStrength(password);
  };

  const autoLogin = async (): Promise<boolean> => {
    return authService.autoLogin();
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Set up token refresh timer and pre-expiry warning
  useEffect(() => {
    if (!state.isAuthenticated || !state.accessToken) return;

    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return;

    const expiryTime = new Date(tokenExpiry);
    const now = new Date();
    const timeUntilExpiry = expiryTime.getTime() - now.getTime();
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // Refresh 5 minutes before expiry
    const warningTime = timeUntilExpiry - 2 * 60 * 1000; // Warn 2 minutes before expiry

    const timers: number[] = [];

    if (refreshTime > 0) {
      const t = window.setTimeout(async () => {
        try {
          const refreshResponse = await authService.refreshToken();
          dispatch({
            type: "TOKEN_REFRESHED",
            payload: refreshResponse.data.accessToken
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch({ type: "TOKEN_EXPIRED" });
        }
      }, refreshTime);
      timers.push(t);
    }

    if (warningTime > 0) {
      const w = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tokenExpired', {
          detail: {
            title: 'Session expiring soon',
            message: 'Your session will expire in about 2 minutes. Please save your work.',
          },
        }));
      }, warningTime);
      timers.push(w);
    } else if (timeUntilExpiry > 0 && timeUntilExpiry <= 2 * 60 * 1000) {
      // If less than 2 minutes remain, show warning immediately
      window.dispatchEvent(new CustomEvent('tokenExpired', {
        detail: {
          title: 'Session expiring soon',
          message: 'Your session will expire in about 2 minutes. Please save your work.',
        },
      }));
    } else if (timeUntilExpiry <= 0) {
      // Token already expired
      dispatch({ type: "TOKEN_EXPIRED" });
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [state.accessToken, state.isAuthenticated]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    checkAuth,
    updateUser,
    hasPermission,
    hasRole,
    validatePassword,
    calculatePasswordStrength,
    autoLogin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
