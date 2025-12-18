import axiosClient from '@/lib/axiosClient';
import { Shop, UpdateShopData, CreateShopData } from '@/types/shop';

export interface DeleteCheckResult {
  canDelete: boolean;
  reason?: string;
  dependencies?: {
    products: number;
    bills: number;
    inventoryHistory: number;
  };
}

export interface PaginatedShopsResult {
  shops: Shop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const shopService = {
  getShop: async (): Promise<Shop> => {
    const response = await axiosClient.get('/shop');
    return response.data.data;
  },

  createShop: async (data: CreateShopData): Promise<Shop> => {
    const response = await axiosClient.post('/shop', data);
    return response.data.data;
  },

  getAllShops: async (page?: number, limit?: number): Promise<PaginatedShopsResult | Shop[]> => {
    const params: Record<string, string> = {};
    if (page !== undefined) params.page = page.toString();
    if (limit !== undefined) params.limit = limit.toString();
    
    const response = await axiosClient.get('/shop/all', { params });
    const data = response.data.data;
    
    // If pagination params were provided, return paginated result
    // Otherwise, return array for backward compatibility
    if (page !== undefined || limit !== undefined) {
      return data as PaginatedShopsResult;
    }
    
    // Backward compatibility: if response has shops array, return it, otherwise return data as array
    if (data && Array.isArray(data.shops)) {
      return data.shops as Shop[];
    }
    
    return Array.isArray(data) ? data : (data.shops || []);
  },

  getShopById: async (id: string): Promise<Shop> => {
    const response = await axiosClient.get(`/shop/${id}`);
    return response.data.data;
  },

  updateShop: async (data: UpdateShopData): Promise<Shop> => {
    const response = await axiosClient.put('/shop', data);
    return response.data.data;
  },

  updateShopById: async (id: string, data: UpdateShopData): Promise<Shop> => {
    const response = await axiosClient.put(`/shop/${id}`, data);
    return response.data.data;
  },

  updateLogo: async (file: File): Promise<Shop> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axiosClient.put('/shop/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  updateLogoById: async (id: string, file: File): Promise<Shop> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axiosClient.put(`/shop/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  checkDeleteDependencies: async (id: string): Promise<DeleteCheckResult> => {
    const response = await axiosClient.get(`/shop/${id}/check-delete`);
    return response.data.data;
  },

  deleteShop: async (id: string): Promise<void> => {
    await axiosClient.delete(`/shop/${id}`);
  },
};

