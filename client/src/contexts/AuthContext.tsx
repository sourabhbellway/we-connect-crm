import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState, LoginRequest } from "../types/auth";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
  triggerTokenExpiry: () => void; // For testing
  manualCheckExpiry: () => boolean; // For DevTools testing
}

type AuthAction =
  | { type: "LOGIN_START" }
  | {
      type: "LOGIN_SUCCESS";
      payload: { user: User; token: string; tokenExpiry: string };
    }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CHECK_AUTH_SUCCESS"; payload: User }
  | { type: "CHECK_AUTH_FAILURE" }
  | { type: "TOKEN_EXPIRED" }
  | { type: "UPDATE_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "TOKEN_EXPIRED":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired. Please login again.",
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
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
        error: null,
      };
    case "CHECK_AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("useAuth called outside AuthProvider!");
    return {
      ...initialState,
      login: async () => {},
      logout: () => {},
      checkAuth: async () => {},
      updateUser: () => {},
      hasPermission: () => false,
      hasRole: () => false,
      isSuperAdmin: () => false,
      triggerTokenExpiry: () => {},
      manualCheckExpiry: () => false,
    };
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Make manualCheckExpiry available globally for DevTools testing
  React.useEffect(() => {
    (window as any).checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem("tokenExpiry");
      if (tokenExpiry) {
        const expiryTime = new Date(tokenExpiry);
        const now = new Date();

        console.log("Manual token expiry check:", {
          tokenExpiry,
          expiryTime: expiryTime.toISOString(),
          now: now.toISOString(),
          isExpired: now >= expiryTime,
        });

        if (now >= expiryTime) {
          dispatch({ type: "TOKEN_EXPIRED" });
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiry");
          return true;
        }
      }
      return false;
    };
  }, []);

  const login_old = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Check if this is a Super Admin login attempt
      const isSuperAdminLogin =
        credentials.email === "superadmin@weconnect.com";

      let response;
      if (isSuperAdminLogin) {
        // Use Super Admin login endpoint
        response = await authService.superAdminLogin(credentials);
      } else {
        // Use regular login endpoint
        response = await authService.login(credentials);
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("tokenExpiry", response.data.tokenExpiry);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
          tokenExpiry: response.data.tokenExpiry,
        },
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An error occurred during login";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw error;
    }
  };
  
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const isSuperAdminLogin =
        credentials.email === "superadmin@weconnect.com";

      let response;
      if (isSuperAdminLogin) {
        response = await authService.superAdminLogin(credentials);
      } else {
        response = await authService.login(credentials);
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("tokenExpiry", response.data.tokenExpiry);
      const userid = response.data.user.id?.toString();
      localStorage.setItem("userId",userid);
      const roleId = response.data.user.roles[0]?.id?.toString() || "";
      // localStorage.setItem("roleId", roleId);
      const rolePermissions = await authService.getPermissionsForRole(roleId);
      const enrichedRoles = response.data.user.roles.map((role: any) => ({
        ...role,
        permissions: rolePermissions,
      }));
      const enrichedUser = {
        ...response.data.user,
        roles: enrichedRoles,
      };
      // console.log("Enriched User:", enrichedUser);  
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: enrichedUser,
          token: response.data.token,
          tokenExpiry: response.data.tokenExpiry,
        },
      });

      return {
        ...response,
        data: {
          ...response.data,
          user: enrichedUser,
        },
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An error occurred during login";
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    dispatch({ type: "LOGOUT" });
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "CHECK_AUTH_FAILURE" });
        return;
      }

      // Decode the JWT token to check if it's a Super Admin token
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));

        // If it's a Super Admin token, get Super Admin profile
        if (tokenPayload.isSuperAdmin === true) {
          try {
            const superAdminResponse = await authService.getSuperAdminProfile();
            dispatch({
              type: "CHECK_AUTH_SUCCESS",
              payload: superAdminResponse.data.user,
            });
            return;
          } catch (superAdminError: any) {
            if (superAdminError.response?.status === 401) {
              dispatch({ type: "TOKEN_EXPIRED" });
            } else {
              dispatch({ type: "CHECK_AUTH_FAILURE" });
            }
            return;
          }
        }
      } catch (decodeError) {
        // If token decoding fails, continue with regular profile check
      }

      // Try to get regular user profile
      try {
        const response = await authService.getProfile();
        dispatch({ type: "CHECK_AUTH_SUCCESS", payload: response.data.user });
      } catch (profileError: any) {
        if (profileError.response?.status === 401) {
          dispatch({ type: "TOKEN_EXPIRED" });
        } else {
          dispatch({ type: "CHECK_AUTH_FAILURE" });
        }
      }
    } catch (error: any) {
      // Handle 401 errors by dispatching TOKEN_EXPIRED
      if (error.response?.status === 401) {
        dispatch({ type: "TOKEN_EXPIRED" });
      } else {
        dispatch({ type: "CHECK_AUTH_FAILURE" });
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Super Admins have all permissions
    if (state.user?.isSuperAdmin === true) {
      return true;
    }

    if (!state.user || !state.user.roles) return false;

    return state.user.roles.some((role) =>
      role.permissions.some((perm) => perm.key === permission)
    );
  };

  const hasRole = (roleName: string): boolean => {
    // Super Admins have all roles
    if (state.user?.isSuperAdmin === true) {
      return true;
    }

    if (!state.user || !state.user.roles) return false;

    return state.user.roles.some((role) => role.name === roleName);
  };

  const isSuperAdmin = (): boolean => {
    return state.user?.isSuperAdmin === true;
  };

  // For testing - manually trigger token expiry
  const triggerTokenExpiry = () => {
    dispatch({ type: "TOKEN_EXPIRED" });
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
  };

  // Check token expiry
  const checkTokenExpiry = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const expiryTime = new Date(tokenExpiry);
      const now = new Date();

      if (now >= expiryTime) {
        dispatch({ type: "TOKEN_EXPIRED" });
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        return true;
      }
    }
    return false;
  };

  // Manual check for DevTools testing
  const manualCheckExpiry = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const expiryTime = new Date(tokenExpiry);
      const now = new Date();

      console.log("Token expiry check:", {
        tokenExpiry,
        expiryTime: expiryTime.toISOString(),
        now: now.toISOString(),
        isExpired: now >= expiryTime,
      });

      if (now >= expiryTime) {
        dispatch({ type: "TOKEN_EXPIRED" });
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        return true;
      }
    }
    return false;
  };

  // Set up token expiry timer
  useEffect(() => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const expiryTime = new Date(tokenExpiry);
      const now = new Date();
      const timeUntilExpiry = expiryTime.getTime() - now.getTime();

      if (timeUntilExpiry > 0) {
        const timer = setTimeout(() => {
          dispatch({ type: "TOKEN_EXPIRED" });
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiry");
        }, timeUntilExpiry);

        return () => clearTimeout(timer);
      } else {
        // Token already expired
        dispatch({ type: "TOKEN_EXPIRED" });
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
      }
    }
  }, [state.token]);

  // Check token expiry when page becomes visible (for DevTools testing)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const tokenExpiry = localStorage.getItem("tokenExpiry");
        if (tokenExpiry) {
          const expiryTime = new Date(tokenExpiry);
          const now = new Date();

          if (now >= expiryTime) {
            dispatch({ type: "TOKEN_EXPIRED" });
            localStorage.removeItem("token");
            localStorage.removeItem("tokenExpiry");
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen for token expiry events from API interceptor
    const handleTokenExpiry = () => {
      dispatch({ type: "TOKEN_EXPIRED" });
    };
    
    window.addEventListener('tokenExpired', handleTokenExpiry);
    
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiry);
    };
  }, []);

  const updateUser = (user: User) => {
    dispatch({ type: "UPDATE_USER", payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
    updateUser,
    hasPermission,
    hasRole,
    isSuperAdmin,
    triggerTokenExpiry,
    manualCheckExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
