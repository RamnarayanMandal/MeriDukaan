import axiosClient from '@/lib/axiosClient';
import {
  Bill,
  CreateBillData,
  UpdateBillData,
} from '@/types/bill';

export interface GetBillsParams {
  shopId?: string;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  customerName?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBills {
  items: Bill[];
  page: number;
  limit: number;
  totalCount: number;
}

export const billService = {
  createBill: async (data: CreateBillData): Promise<Bill> => {
    const response = await axiosClient.post('/bills', data);
    return response.data.data;
  },

  getBills: async (params?: GetBillsParams): Promise<PaginatedBills> => {
    const response = await axiosClient.get('/bills', { params });
    return response.data.data;
  },

  getBillById: async (id: string): Promise<Bill> => {
    const response = await axiosClient.get(`/bills/${id}`);
    return response.data.data;
  },

  getBillByNumber: async (billNumber: string): Promise<Bill> => {
    const response = await axiosClient.get(`/bills/number/${billNumber}`);
    return response.data.data;
  },

  updateBill: async (
    id: string,
    data: UpdateBillData
  ): Promise<Bill> => {
    const response = await axiosClient.put(`/bills/${id}`, data);
    return response.data.data;
  },

  deleteBill: async (id: string): Promise<void> => {
    await axiosClient.delete(`/bills/${id}`);
  },
};

