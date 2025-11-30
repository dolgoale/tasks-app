import axios from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, TaskListResponse, TaskFilter, TaskPriority } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Tasks
  getTasks: async (filter?: TaskFilter, category?: string, priority?: TaskPriority): Promise<TaskListResponse> => {
    const params: any = {};
    if (filter) params.filter_completed = filter;
    if (category) params.category = category;
    if (priority) params.priority = priority.toLowerCase();
    const response = await apiClient.get<TaskListResponse>('/tasks', { params });
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/tasks/categories');
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks/', task);
    return response.data;
  },

  updateTask: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  toggleTaskCompletion: async (id: number): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export default api;

