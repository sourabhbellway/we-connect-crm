import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { userService } from "../services/userService";
import { leadService } from "../services/leadService";
import { contactService } from "../services/contactService";
import { dealService } from "../services/dealService";
import { roleService } from "../services/roleService";
import { useAuth } from "./AuthContext";
import { activityService } from "../services/activityService";

interface CountsContextType {
  counts: {
    users: number;
    leads: number;
    contacts: number;
    deals: number;
    roles: number;
    trashUsers: number;
    trashLeads: number;
    trashRoles: number;
  };
  refreshCounts: () => Promise<void>;
  refreshUsersCount: () => Promise<void>;
  refreshLeadsCount: () => Promise<void>;
  refreshContactsCount: () => Promise<void>;
  refreshDealsCount: () => Promise<void>;
  refreshRolesCount: () => Promise<void>;
  refreshTrashCounts: () => Promise<void>;
}

const CountsContext = createContext<CountsContextType | undefined>(undefined);

interface CountsProviderProps {
  children: ReactNode;
}

export const CountsProvider: React.FC<CountsProviderProps> = ({ children }) => {
  const [counts, setCounts] = useState({
    users: 0,
    leads: 0,
    contacts: 0,
    deals: 0,
    roles: 0,
    trashUsers: 0,
    trashLeads: 0,
    trashRoles: 0,
  });
  const { isAuthenticated, hasPermission } = useAuth();

  const refreshCounts = async () => {
    if (!isAuthenticated) return;
    try {
      const canReadUsers = hasPermission("user.read");
      const canReadLeads = hasPermission("lead.read");
      const canReadContacts = hasPermission("contact.read");
      const canReadDeals = hasPermission("deal.read");
      const canReadRoles = hasPermission("role.read");
      const canReadDeleted = hasPermission("deleted.read");

      const [usersResponse, leadsResponse, contactsResponse, dealsResponse, rolesResponse, deletedRes] = await Promise.all([
        canReadUsers
          ? userService.getUsers().catch(() => ({ data: { users: [] } }))
          : Promise.resolve({ data: { users: [] } }),
        canReadLeads
          ? leadService.getLeads().catch(() => ({ data: { leads: [] } }))
          : Promise.resolve({ data: { leads: [] } }),
        canReadContacts
          ? contactService.getContacts().catch((err) => {
              console.log('Contacts API not available yet:', err.response?.status);
              return { data: { contacts: [] } };
            })
          : Promise.resolve({ data: { contacts: [] } }),
        canReadDeals
          ? dealService.getDeals().catch((err) => {
              console.log('Deals API not available yet:', err.response?.status);
              return { data: { deals: [] } };
            })
          : Promise.resolve({ data: { deals: [] } }),
        canReadRoles
          ? roleService.getRoles().catch(() => ({ data: { roles: [] } }))
          : Promise.resolve({ data: { roles: [] } }),
        canReadDeleted
          ? activityService
              .getDeletedData(1, 1)
              .catch(() => ({ data: { users: { total: 0 }, leads: { total: 0 }, roles: { total: 0 } } }))
          : Promise.resolve({ data: { users: { total: 0 }, leads: { total: 0 }, roles: { total: 0 } } }),
      ]);

      setCounts({
        users: usersResponse.data.users?.length || 0,
        leads: leadsResponse.data.leads?.length || 0,
        contacts: contactsResponse.data.contacts?.length || 0,
        deals: dealsResponse.data.deals?.length || 0,
        roles: rolesResponse.data.roles?.length || 0,
        trashUsers: deletedRes?.data?.users?.total ?? 0,
        trashLeads: deletedRes?.data?.leads?.total ?? 0,
        trashRoles: deletedRes?.data?.roles?.total ?? 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const refreshUsersCount = async () => {
    try {
      if (!isAuthenticated) return;
      if (!hasPermission("user.read")) return;
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
      if (!isAuthenticated) return;
      if (!hasPermission("lead.read")) return;
      const response = await leadService.getLeads();
      setCounts((prev) => ({
        ...prev,
        leads: response.data.leads?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching leads count:", error);
    }
  };

  const refreshContactsCount = async () => {
    try {
      if (!isAuthenticated) return;
      if (!hasPermission("contact.read")) return;
      const response = await contactService.getContacts();
      setCounts((prev) => ({
        ...prev,
        contacts: response.data.contacts?.length || 0,
      }));
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching contacts count:", error);
      }
    }
  };

  const refreshDealsCount = async () => {
    try {
      if (!isAuthenticated) return;
      if (!hasPermission("deal.read")) return;
      const response = await dealService.getDeals();
      setCounts((prev) => ({
        ...prev,
        deals: response.data.deals?.length || 0,
      }));
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching deals count:", error);
      }
    }
  };

  const refreshRolesCount = async () => {
    try {
      if (!isAuthenticated) return;
      if (!hasPermission("role.read")) return;
      const response = await roleService.getRoles();
      setCounts((prev) => ({
        ...prev,
        roles: response.data.roles?.length || 0,
      }));
    } catch (error) {
      console.error("Error fetching roles count:", error);
    }
  };

  const refreshTrashCounts = async () => {
    try {
      if (!isAuthenticated) return;
      if (!hasPermission("deleted.read")) return;
      const res = await activityService.getDeletedData(1, 1);
      setCounts((prev) => ({
        ...prev,
        trashUsers: res?.data?.users?.total ?? 0,
        trashLeads: res?.data?.leads?.total ?? 0,
        trashRoles: res?.data?.roles?.total ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching trash counts:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCounts();
    }
  }, [isAuthenticated]);

  return (
    <CountsContext.Provider
      value={{
        counts,
        refreshCounts,
        refreshUsersCount,
        refreshLeadsCount,
        refreshContactsCount,
        refreshDealsCount,
        refreshRolesCount,
        refreshTrashCounts,
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
