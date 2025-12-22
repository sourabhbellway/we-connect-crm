import axios from "axios";
import { API_BASE_URL } from "../config/config";
import { STORAGE_KEYS } from "../constants";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export interface Note {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  leadId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateNoteDto {
  title: string;
  content: string;
  isPinned?: boolean;
  leadId: number;
  createdBy?: number;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

export const notesService = {
  // Get all notes for a lead
  getNotesByLeadId: async (leadId: number) => {
    try {
      const response = await createAuthInstance().get(
        `/notes?leadId=${leadId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  },

  // Get a single note by ID
  getNoteById: async (id: number) => {
    try {
      const response = await createAuthInstance().get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching note:", error);
      throw error;
    }
  },

  // Create a new note
  createNote: async (noteData: CreateNoteDto) => {
    try {
      const response = await createAuthInstance().post("/notes", noteData);
      return response.data;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  // Update a note
  updateNote: async (id: number, noteData: UpdateNoteDto) => {
    try {
      const response = await createAuthInstance().put(`/notes/${id}`, noteData);
      return response.data;
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (id: number) => {
    try {
      const response = await createAuthInstance().delete(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },
};

