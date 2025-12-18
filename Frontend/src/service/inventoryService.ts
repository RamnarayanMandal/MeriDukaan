import axiosClient from '@/lib/axiosClient';

export type InventoryActionType = 'ADD' | 'SALE' | 'UPDATE' | 'DELETE' | 'BILL_EDIT';

export interface InventoryHistoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    productCode?: string;
  } | string;
  shopId: string;
  actionType: InventoryActionType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  createdAt: string;
}

export interface GetInventoryHistoryParams {
  shopId: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedInventoryHistory {
  items: InventoryHistoryItem[];
  page: number;
  limit: number;
  totalCount: number;
}

export const inventoryService = {
  getHistory: async (
    params: GetInventoryHistoryParams
  ): Promise<PaginatedInventoryHistory> => {
    const response = await axiosClient.get('/inventory-history', { params });
    return response.data.data;
  },
};


