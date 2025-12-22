import apiClient from "./apiClient";

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const productCategoriesService = {
  getProductCategories: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get("/business-settings/product-categories");
    return response.data;
  },

  createProductCategory: async (
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiClient.post("/business-settings/product-categories", categoryData);
    return response.data;
  },

  updateProductCategory: async (
    id: number,
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiClient.patch(`/business-settings/product-categories/${id}`, categoryData);
    return response.data;
  },

  deleteProductCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/business-settings/product-categories/${id}`);
  },

  toggleProductCategory: async (id: number): Promise<ProductCategory> => {
    const response = await apiClient.patch(`/business-settings/product-categories/${id}/toggle`);
    return response.data;
  },
};