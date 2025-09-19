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
    };
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // No global testing helpers
  React.useEffect(() => {}, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await authService.login(credentials);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("tokenExpiry", response.data.tokenExpiry);
      const userid = response.data.user.id?.toString();
      if (userid) {
        localStorage.setItem("userId", userid);
      }

      // Fetch roles from new API and enrich with permissions
      let rolesFromApi: any[] = [];
      try {
        if (userid) {
          const rolesResp = await userService.getUserRoles(Number(userid));
          rolesFromApi = (rolesResp as any)?.data?.user?.roles
            ?? (rolesResp as any)?.roles
            ?? (rolesResp as any)?.data?.roles
            ?? (Array.isArray(rolesResp) ? (rolesResp as any) : []);
        }
      } catch (e) {
        console.error("Failed to fetch user roles from API", e);
        rolesFromApi = [];
      }

      let enrichedRoles = rolesFromApi;
      try {
        const rolesNeedingPermissions = enrichedRoles.filter(
          (r: any) => !Array.isArray(r?.permissions) || r.permissions.length === 0
        );
        if (rolesNeedingPermissions.length > 0) {
          const permissionsByRoleIdEntries = await Promise.all(
            rolesNeedingPermissions.map(async (r: any) => {
              try {
                const perms = await authService.getPermissionsForRole(String(r.id));
                return [r.id, perms] as const;
              } catch (err) {
                console.error("Failed to fetch permissions for role", r?.id, err);
                return [r.id, []] as const;
              }
            })
          );
          const permissionsByRoleId = new Map<number, any[]>(permissionsByRoleIdEntries as any);
          enrichedRoles = enrichedRoles.map((r: any) => ({
            ...r,
            permissions: Array.isArray(r?.permissions) && r.permissions.length > 0
              ? r.permissions
              : permissionsByRoleId.get(r.id) || [],
          }));
        }
      } catch (e) {
        console.error("Failed to enrich roles with permissions", e);
      }

      const enrichedUser = {
        ...response.data.user,
        roles: enrichedRoles,
      } as any;
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: enrichedUser,
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
      // Try to get regular user profile
      try {
        const response = await authService.getProfile();
        const baseUser = response.data.user;

        // Fetch roles from new API and enrich with permissions
        let rolesFromApi: any[] = [];
        try {
          const uid = baseUser?.id;
          if (typeof uid === "number") {
            const rolesResp = await userService.getUserRoles(uid);
            rolesFromApi = (rolesResp as any)?.data?.user?.roles
              ?? (rolesResp as any)?.roles
              ?? (rolesResp as any)?.data?.roles
              ?? (Array.isArray(rolesResp) ? (rolesResp as any) : []);
          }
        } catch (e) {
          console.error("Failed to fetch user roles during checkAuth", e);
        }

        let enrichedRoles = rolesFromApi;
        try {
          const rolesNeedingPermissions = enrichedRoles.filter(
            (r: any) => !Array.isArray(r?.permissions) || r.permissions.length === 0
          );
          if (rolesNeedingPermissions.length > 0) {
            const permissionsByRoleIdEntries = await Promise.all(
              rolesNeedingPermissions.map(async (r: any) => {
                try {
                  const perms = await authService.getPermissionsForRole(String(r.id));
                  return [r.id, perms] as const;
                } catch (err) {
                  console.error("Failed to fetch permissions for role", r?.id, err);
                  return [r.id, []] as const;
                }
              })
            );
            const permissionsByRoleId = new Map<number, any[]>(permissionsByRoleIdEntries as any);
            enrichedRoles = enrichedRoles.map((r: any) => ({
              ...r,
              permissions: Array.isArray(r?.permissions) && r.permissions.length > 0
                ? r.permissions
                : permissionsByRoleId.get(r.id) || [],
            }));
          }
        } catch (e) {
          console.error("Failed to enrich roles with permissions during checkAuth", e);
        }

        const enrichedUser = { ...(baseUser as any), roles: enrichedRoles } as any;
        dispatch({ type: "CHECK_AUTH_SUCCESS", payload: enrichedUser });
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
    if (!state.user || !state.user.roles) return false;

    return state.user.roles.some((role) =>
      role.permissions.some((perm) => perm.key === permission)
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!state.user || !state.user.roles) return false;

    return state.user.roles.some((role) => role.name === roleName);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
