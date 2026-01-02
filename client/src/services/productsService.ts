import apiClient from './apiClient';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  type: string;
  category?: string;
  price: number;
  cost?: number;
  currency: string;
  unit?: string;
  taxRate?: number;
  hsnCode?: string;
  isActive: boolean;
  image?: string;
  companyId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  type?: string;
  category?: string;
  price: number;
  cost?: number;
  currency?: string;
  unit?: string;
  taxRate?: number;
  hsnCode?: string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

class ProductsService {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const response = await apiClient.get('/products', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }

  async create(data: CreateProductDto) {
    const response = await apiClient.post('/products', data);
    return response.data;
  }

  async update(id: number, data: UpdateProductDto) {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  }

  async remove(id: number) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }

  async bulkExport(params?: { search?: string }) {
    const response = await apiClient.get('/products/bulk/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async bulkImport(file: File) {
    const formData = new FormData();
    formData.append('csvFile', file);
    const response = await apiClient.post('/products/bulk/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async bulkDelete(ids: number[]) {
    const response = await apiClient.delete('/products/bulk/delete', {
      data: { ids },
    });
    return response.data;
  }
}


export const productsService = new ProductsService();
