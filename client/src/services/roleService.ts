import apiClient from "./apiClient";

export interface RoleFilters {
  search?: string;
  showOnlyActive?: boolean;
  page?: number;
  limit?: number;
}

export const roleService = {
  getRoles: async (filters: RoleFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.showOnlyActive) params.append("includeInactive", "false");
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/roles?${queryString}` : "/roles";

    const response = await apiClient.get(url);
    return response.data;
  },

  createRole: async (roleData: any) => {
    const response = await apiClient.post("/roles", roleData);
    return response.data;
  },

  updateRole: async (id: number, roleData: any) => {
    const response = await apiClient.put(`/roles/${id}`, roleData);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await apiClient.get("/permissions");
    return response.data;
  },

  assignRoleToUser: async (userId: number, roleIds: number[]) => {
    const response = await apiClient.put(`/users/${userId}/role`, { roleIds });
    return response.data;
  },
};
