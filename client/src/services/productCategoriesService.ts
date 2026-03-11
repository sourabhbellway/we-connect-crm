import { apiRequest } from "./apiClient";

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
    const response = await apiRequest.get<any>("/business-settings/product-categories");
    return Array.isArray(response) ? response : response?.data || [];
  },

  createProductCategory: async (
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiRequest.post<any>(
      "/business-settings/product-categories",
      categoryData
    );
    return response?.data?.category || response?.data || response;
  },

  updateProductCategory: async (
    id: number,
    categoryData: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    const response = await apiRequest.patch<any>(
      `/business-settings/product-categories/${id}`,
      categoryData
    );
    return response?.data?.category || response?.data || response;
  },

  deleteProductCategory: async (id: number): Promise<void> => {
    await apiRequest.delete(`/business-settings/product-categories/${id}`);
  },

  toggleProductCategory: async (id: number): Promise<ProductCategory> => {
    const response = await apiRequest.patch<any>(
      `/business-settings/product-categories/${id}/toggle`
    );
    return response?.data?.category || response?.data || response;
  },
};
