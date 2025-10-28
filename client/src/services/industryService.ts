import apiClient from "./apiClient";

export interface IndustryField {
  id: number;
  industryId: number;
  name: string;
  type?:
    | "TEXT"
    | "NUMBER"
    | "DATE"
    | "TIME"
    | "DROPDOWN"
    | "MULTI_SELECT"
    | "CHECKBOX"
    | "TOGGLE"
    | "FILE";
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Industry {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: IndustryField[];
}

export const industryService = {
  async getIndustries(): Promise<Industry[]> {
    const response = await apiClient.get("/industries");
    return (response.data?.data?.industries ?? response.data) as Industry[];
  },

  async createIndustry(payload: Partial<Industry>): Promise<Industry> {
    const response = await apiClient.post("/industries", payload);
    return (response.data?.data?.industry ?? response.data) as Industry;
  },

  async updateIndustry(
    id: number,
    payload: Partial<Industry>
  ): Promise<Industry> {
    const response = await apiClient.put(`/industries/${id}`, payload);
    return (response.data?.data?.industry ?? response.data) as Industry;
  },

  async deleteIndustry(id: number): Promise<void> {
    await apiClient.delete(`/industries/${id}`);
  },

  async addField(
    industryId: number,
    payload: Partial<IndustryField>
  ): Promise<IndustryField> {
    const response = await apiClient.post(
      `/industries/${industryId}/fields`,
      payload
    );
    return (response.data?.data?.field ?? response.data) as IndustryField;
  },

  async updateField(
    fieldId: number,
    payload: Partial<IndustryField>
  ): Promise<IndustryField> {
    const response = await apiClient.put(
      `/industries/fields/${fieldId}`,
      payload
    );
    return (response.data?.data?.field ?? response.data) as IndustryField;
  },

  async deleteField(fieldId: number): Promise<void> {
    await apiClient.delete(`/industries/fields/${fieldId}`);
  },
};
