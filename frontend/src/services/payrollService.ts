import api from './api';
import { Payroll, PayrollGenerateRequest } from '../types';

export const payrollService = {
  generate: async (request: PayrollGenerateRequest): Promise<Payroll> => {
    const response = await api.post('/payroll/generate', request);
    return response.data;
  },

  getById: async (id: number): Promise<Payroll> => {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  getByEmployeeAndPeriod: async (employeeId: number, year: number, month: number): Promise<Payroll> => {
    const response = await api.get(`/payroll/employee/${employeeId}`, {
      params: { year, month },
    });
    return response.data;
  },

  listByEmployeeYear: async (employeeId: number, year: number): Promise<Payroll[]> => {
    const response = await api.get(`/payroll/employee/${employeeId}/year/${year}`);
    return response.data;
  },

  getAllByEmployee: async (employeeId: number): Promise<Payroll[]> => {
    const response = await api.get(`/payroll/employee/${employeeId}/all`);
    return response.data;
  },

  delete: async (id: number, requesterId: number): Promise<void> => {
    await api.delete(`/payroll/${id}`, { params: { requesterId } });
  },
};
