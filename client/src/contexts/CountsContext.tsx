import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userService } from "../services/userService";
import { leadService } from "../services/leadService";
import { roleService } from "../services/roleService";

interface CountsContextType {
  counts: {
    users: number;
    leads: number;
    roles: number;
  };
  refreshCounts: () => Promise<void>;
  refreshUsersCount: () => Promise<void>;
  refreshLeadsCount: () => Promise<void>;
  refreshRolesCount: () => Promise<void>;
}

const CountsContext = createContext<CountsContextType | undefined>(undefined);

interface CountsProviderProps {
  children: ReactNode;
}

export const CountsProvider: React.FC<CountsProviderProps> = ({ children }) => {
  const [counts, setCounts] = useState({
    users: 0,
    leads: 0,
    roles: 0,
  });

  const refreshCounts = async () => {
    try {
      const [usersResponse, leadsResponse, rolesResponse] = await Promise.all([
        userService.getUsers().catch(() => ({ data: { users: [] } })),
        leadService.getLeads().catch(() => ({ data: { leads: [] } })),
        roleService.getRoles().catch(() => ({ data: { roles: [] } })),
      ]);

      setCounts({
        users: usersResponse.data.users?.length || 0,
        leads: leadsResponse.data.leads?.length || 0,
        roles: rolesResponse.data.roles?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const refreshUsersCount = async () => {
    try {
      const response = await userService.getUsers();
      setCounts((prev) => ({
        ...prev,
        users: response.data.users?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching users count:", error);
    }
  };

  const refreshLeadsCount = async () => {
    try {
      const response = await leadService.getLeads();
      setCounts((prev) => ({
        ...prev,
        leads: response.data.leads?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching leads count:", error);
    }
  };

  const refreshRolesCount = async () => {
    try {
      const response = await roleService.getRoles();
      setCounts((prev) => ({
        ...prev,
        roles: response.data.roles?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching roles count:", error);
    }
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <CountsContext.Provider
      value={{
        counts,
        refreshCounts,
        refreshUsersCount,
        refreshLeadsCount,
        refreshRolesCount,
      }}
    >
      {children}
    </CountsContext.Provider>
  );
};

export const useCounts = () => {
  const context = useContext(CountsContext);
  if (context === undefined) {
    throw new Error("useCounts must be used within a CountsProvider");
  }
  return context;
};
