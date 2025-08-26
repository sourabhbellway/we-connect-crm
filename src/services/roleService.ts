import apiClient from "./authService";

export const roleService = {
  getRoles: async (showOnlyActive = false) => {
    const response = await apiClient.get(
      `/roles${showOnlyActive ? "?includeInactive=false" : ""}`
    );
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
