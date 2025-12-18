import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  productService,
  GetProductsParams,
  PaginatedProducts,
} from '@/service/productService';
import {
  Product,
  CreateProductData,
  UpdateProductData,
} from '@/types/product';
import { showSuccess, showError } from '@/lib/sweetAlert';

export const useProducts = (params?: GetProductsParams) => {
  return useQuery<PaginatedProducts>({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess('Success', 'Product created successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      showSuccess('Success', 'Product updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showSuccess('Success', 'Product deleted successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to delete product');
    },
  });
};

