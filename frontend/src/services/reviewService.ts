import api from './api';
import { Review, ReviewIU } from '../types';

export const reviewService = {
  add: async (review: ReviewIU): Promise<Review> => {
    const response = await api.post('/reviews/add', review);
    return response.data;
  },

  update: async (id: number, review: ReviewIU): Promise<ReviewIU> => {
    const response = await api.put(`/reviews/update/${id}`, review);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/delete/${id}`);
  },

  getByEmployeeId: async (employeeId: number): Promise<Review[]> => {
    const response = await api.get(`/reviews/employee/${employeeId}`);
    return response.data;
  },
};
