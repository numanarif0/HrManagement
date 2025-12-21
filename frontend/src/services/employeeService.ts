import api from './api';
import { Employee } from '../types';

export const employeeService = {
  register: async (employee: Employee): Promise<Employee> => {
    const response = await api.post('/employees/register', employee);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<Employee> => {
    const response = await api.post('/employees/login', credentials);
    return response.data;
  },

  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/all');
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  update: async (id: number, employee: Employee): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};
