import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  website?: string;
  notes?: string;
  assignedTo?: number;
  companyId?: number;
  assignedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface ContactResponse {
  success: boolean;
  data: Contact;
  message?: string;
}

class ContactService {
  async getContacts(page: number = 1, limit: number = 10, search?: string): Promise<ContactsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiClient.get(`${API_ENDPOINTS.CONTACTS.BASE}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContactById(id: number): Promise<ContactResponse> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.CONTACTS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  async createContact(contactData: Partial<Contact>): Promise<ContactResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACTS.BASE, contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id: number, contactData: Partial<Contact>): Promise<ContactResponse> {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.CONTACTS.BASE}/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.CONTACTS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async getContact(id: number): Promise<ContactResponse> {
    return this.getContactById(id);
  }

  async getContactStats(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTACTS.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService();