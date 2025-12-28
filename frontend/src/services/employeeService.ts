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

  getApproved: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/approved');
    return response.data;
  },

  getPending: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/pending');
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

  approve: async (id: number, approverId: number): Promise<Employee> => {
    const response = await api.post(`/employees/${id}/approve?approverId=${approverId}`);
    return response.data;
  },

  reject: async (id: number): Promise<Employee> => {
    const response = await api.post(`/employees/${id}/reject`);
    return response.data;
  },

  getByQrCode: async (qrCode: string): Promise<Employee> => {
    const response = await api.get(`/employees/qr/${qrCode}`);
    return response.data;
  },

  regenerateQrCode: async (id: number): Promise<Employee> => {
    const response = await api.post(`/employees/${id}/regenerate-qr`);
    return response.data;
  },
};
