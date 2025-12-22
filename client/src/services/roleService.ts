import apiClient from "./apiClient";

// Helper function for exponential backoff retry
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

export interface RoleFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const roleService = {
  getRoles: async (filters: RoleFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/roles?${queryString}` : "/roles";

    const response = await apiClient.get(url);
    return response.data;
  },

  createRole: async (roleData: any) => {
    // Whitelist payload to satisfy Nest ValidationPipe (forbidNonWhitelisted)
    const payload = {
      name: roleData.name,
      description: roleData.description ?? "",
      accessScope: roleData.accessScope,
      isActive: typeof roleData.isActive === "boolean" ? roleData.isActive : true,
      permissionIds: Array.isArray(roleData.permissionIds) ? roleData.permissionIds : [],
    };
    const response = await apiClient.post("/roles", payload);
    return response.data;
  },

  updateRole: async (id: number, roleData: any) => {
    const payload = {
      name: roleData.name,
      description: roleData.description ?? "",
      accessScope: roleData.accessScope,
      isActive: typeof roleData.isActive === "boolean" ? roleData.isActive : undefined,
      permissionIds: Array.isArray(roleData.permissionIds) ? roleData.permissionIds : [],
    };
    const response = await apiClient.put(`/roles/${id}`, payload);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  // Get users assigned to a specific role
  getUsersByRole: async (roleId: number) => {
    try {
      const response = await apiClient.get(`/roles/${roleId}/users`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching users by role:", error);
      return { success: false, data: [] };
    }
  },

  getPermissions: async () => {
    const response = await apiClient.get("/permissions");
    return response.data;
  },

  assignRoleToUser: async (userId: number, roleIds: number[]) => {
    const response = await apiClient.put(`/users/${userId}/role`, { roleIds });
    return response.data;
  },

  // Get deleted roles
  getDeletedRoles: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    params.append("isDeleted", "true");
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await apiClient.get(`/roles?${params.toString()}`);
    return response.data;
  },

  // Restore a deleted role
  restoreRole: async (id: number) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.put(`/roles/${id}/restore`);
        return response.data;
      } catch (error: any) {
        console.error("Role restore error:", {
          id,
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  },

  // Permanently delete a trashed role
  deleteRolePermanently: async (id: number) => {
    return retryWithBackoff(async () => {
      try {
        const response = await apiClient.delete(`/roles/${id}/permanent`);
        return response.data;
      } catch (error: any) {
        console.error("Role permanent delete error:", {
          id,
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  },
};
