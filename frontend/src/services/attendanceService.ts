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

  checkIn: async (data: AttendanceRequest): Promise<Attendance> => {
    const response = await api.post('/attandance/checkin', data);
    return response.data;
  },

  checkOut: async (data: AttendanceRequest): Promise<Attendance> => {
    const response = await api.post('/attandance/checkout', data);
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

  updateRecord: async (id: number, data: Partial<Attendance>): Promise<Attendance> => {
    const response = await api.put(`/attandance/${id}`, data);
    return response.data;
  },

  deleteRecord: async (id: number): Promise<void> => {
    await api.delete(`/attandance/${id}`);
  },
};
