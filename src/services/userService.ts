import apiClient from "./authService";

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

export const userService = {
  getUsers: async (filters?: {
    search?: string;
    status?: string;
    roleId?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.roleId) params.append("roleId", filters.roleId);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : "/users";

    const response = await apiClient.get(url);
    return response.data;
  },

  createUser: async (userData: any) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.post("/users", userData);
      return response.data;
    });
  },

  updateUser: async (id: number, userData: any) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    });
  },

  deleteUser: async (id: number) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    });
  },

  // New Profile Management APIs
  updateProfile: async (profileData: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    return retryWithBackoff(async () => {
      const response = await apiClient.put("/users/profile", profileData);
      return response.data;
    });
  },

  getProfile: async () => {
    return retryWithBackoff(async () => {
      const response = await apiClient.get("/users/profile");
      return response.data;
    });
  },

  getUserStats: async () => {
    return retryWithBackoff(async () => {
      const response = await apiClient.get("/users/stats");
      return response.data;
    });
  },
};
