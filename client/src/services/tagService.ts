import apiClient from "./authService";

export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get("/tags");
    return response.data;
  },

  createTag: async (tagData: Partial<Tag>): Promise<Tag> => {
    const response = await apiClient.post("/tags", tagData);
    return response.data;
  },

  updateTag: async (id: number, tagData: Partial<Tag>): Promise<Tag> => {
    const response = await apiClient.put(`/tags/${id}`, tagData);
    return response.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await apiClient.delete(`/tags/${id}`);
  },
};
