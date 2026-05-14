import axiosClient from '@/lib/axiosClient';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductCategory,
} from '@/types/product';

export interface GetProductsParams {
  shopId?: string;
  category?: ProductCategory;
  search?: string;
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD)
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  totalCount: number;
}

export const productService = {
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await axiosClient.post('/products', data);
    return response.data.data;
  },

  getProducts: async (
    params?: GetProductsParams
  ): Promise<PaginatedProducts> => {
    const response = await axiosClient.get('/products', { params });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data.data;
  },

  getProductByBarcode: async (barcode: string, shopId: string): Promise<Product> => {
    const response = await axiosClient.get(`/products/barcode/${barcode}`, { 
      params: { shopId } 
    });
    return response.data.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductData
  ): Promise<Product> => {
    const response = await axiosClient.put(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },
};

