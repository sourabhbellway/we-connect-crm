import apiClient from './apiClient';

export interface UnitType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUnitTypeDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateUnitTypeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const unitTypesService = {
  // Get all unit types
  async getAll(): Promise<UnitType[]> {
    const response = await apiClient.get('/business-settings/unit-types');
    return response.data;
  },

  // Get unit type by ID
  async getById(id: number): Promise<UnitType> {
    const response = await apiClient.get(`/business-settings/unit-types/${id}`);
    return response.data;
  },

  // Create new unit type
  async create(data: CreateUnitTypeDto): Promise<UnitType> {
    const response = await apiClient.post('/business-settings/unit-types', data);
    return response.data;
  },

  // Update unit type
  async update(id: number, data: UpdateUnitTypeDto): Promise<UnitType> {
    const response = await apiClient.patch(`/business-settings/unit-types/${id}`, data);
    return response.data;
  },

  // Delete unit type
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/business-settings/unit-types/${id}`);
  },

  // Toggle unit type active status
  async toggle(id: number): Promise<UnitType> {
    const response = await apiClient.patch(`/business-settings/unit-types/${id}/toggle`);
    return response.data;
  },
};