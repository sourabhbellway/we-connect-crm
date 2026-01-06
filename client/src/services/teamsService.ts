import apiClient from './apiClient';

export interface Team {
    id: number;
    name: string;
    description?: string;
    managerId?: number;
    productId?: number;
    manager?: {
        id: number;
        firstName: string;
        lastName: string;
    };
    members?: Array<{
        id: number;
        firstName: string;
        lastName: string;
    }>;
    product?: {
        id: number;
        name: string;
    };
    _count?: {
        members: number;
    };
    createdAt: string;
}

export interface CreateTeamPayload {
    name: string;
    description?: string;
    managerId?: number;
    memberIds?: number[];
    productId?: number;
}

export interface UpdateTeamPayload extends Partial<CreateTeamPayload> { }

export const teamsService = {
    getAll: async () => {
        const response = await apiClient.get<Team[]>('/teams');
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await apiClient.get<Team>(`/teams/${id}`);
        return response.data;
    },

    create: async (data: CreateTeamPayload) => {
        const response = await apiClient.post<Team>('/teams', data);
        return response.data;
    },

    update: async (id: number | string, data: UpdateTeamPayload) => {
        const response = await apiClient.patch<Team>(`/teams/${id}`, data);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await apiClient.delete(`/teams/${id}`);
        return response.data;
    },
};
