import api from './api';
import { Attendance } from '../types';

interface AttendanceRequest {
  employeeId: number;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export const attendanceService = {
  saveRecord: async (data: AttendanceRequest): Promise<Attendance> => {
    const response = await api.post('/attandance/save', data);
    return response.data;
  },

  checkIn: async (employeeId: number): Promise<Attendance> => {
    const response = await api.post('/attandance/checkin', { employeeId });
    return response.data;
  },

  checkOut: async (employeeId: number): Promise<Attendance> => {
    const response = await api.post('/attandance/checkout', { employeeId });
    return response.data;
  },

  checkInByQr: async (qrCode: string): Promise<Attendance> => {
    const response = await api.post(`/attandance/qr/checkin/${qrCode}`);
    return response.data;
  },

  checkOutByQr: async (qrCode: string): Promise<Attendance> => {
    const response = await api.post(`/attandance/qr/checkout/${qrCode}`);
    return response.data;
  },

  getTodayStatus: async (employeeId: number): Promise<Attendance | null> => {
    try {
      const response = await api.get(`/attandance/today/${employeeId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  getWeeklyRecords: async (employeeId: number): Promise<Attendance[]> => {
    const response = await api.get(`/attandance/weekly/${employeeId}`);
    return response.data;
  },

  getMonthlyRecords: async (employeeId: number, year: number, month: number): Promise<Attendance[]> => {
    const response = await api.get(`/attandance/monthly/${employeeId}`, {
      params: { year, month },
    });
    return response.data;
  },

  getRecentRecords: async (employeeId: number, limit: number = 10): Promise<Attendance[]> => {
    const response = await api.get(`/attandance/recent/${employeeId}`, {
      params: { limit },
    });
    return response.data;
  },

  getAllRecords: async (): Promise<Attendance[]> => {
    const response = await api.get('/attandance/all');
    return response.data;
  },

  getRecordsByDate: async (date: string): Promise<Attendance[]> => {
    const response = await api.get(`/attandance/date/${date}`);
    return response.data;
  },

  searchRecords: async (params: {
    employeeId?: number;
    employeeName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> => {
    const response = await api.get('/attandance/search', { params });
    return response.data;
  },

  updateRecord: async (id: number, data: Partial<Attendance>, requesterId: number): Promise<Attendance> => {
    const response = await api.put(`/attandance/${id}`, data, { params: { requesterId } });
    return response.data;
  },

  deleteRecord: async (id: number, requesterId: number): Promise<void> => {
    await api.delete(`/attandance/${id}`, { params: { requesterId } });
  },
};
