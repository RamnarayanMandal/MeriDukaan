import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopService, DeleteCheckResult, PaginatedShopsResult } from '@/service/shopService';
import { Shop, UpdateShopData, CreateShopData } from '@/types/shop';
import { showSuccess, showError } from '@/lib/sweetAlert';

export const useShop = () => {
  return useQuery<Shop>({
    queryKey: ['shop'],
    queryFn: shopService.getShop,
  });
};

export const useAllShops = () => {
  return useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: async () => {
      const result = await shopService.getAllShops();
      // Handle both paginated and array responses for backward compatibility
      if (Array.isArray(result)) {
        return result;
      }
      // If paginated result, extract shops array
      return (result as PaginatedShopsResult).shops || [];
    },
  });
};

export const useAllShopsPaginated = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedShopsResult>({
    queryKey: ['shops', 'paginated', page, limit],
    queryFn: async () => {
      const result = await shopService.getAllShops(page, limit);
      // Ensure we return paginated result
      if (Array.isArray(result)) {
        // If backend returns array (backward compatibility), wrap it
        return {
          shops: result,
          pagination: {
            page: 1,
            limit: result.length,
            total: result.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      return result as PaginatedShopsResult;
    },
  });
};

export const useShopById = (id: string | null) => {
  return useQuery<Shop>({
    queryKey: ['shop', id],
    queryFn: () => shopService.getShopById(id!),
    enabled: !!id,
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateShopData) => shopService.updateShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showSuccess('Success', 'Shop details updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update shop details');
    },
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShopData) => shopService.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showSuccess('Success', 'Shop created successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to create shop');
    },
  });
};

export const useUpdateShopById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShopData }) =>
      shopService.updateShopById(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop', variables.id] });
      showSuccess('Success', 'Shop details updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update shop details');
    },
  });
};

export const useUpdateLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => shopService.updateLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showSuccess('Success', 'Logo updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update logo');
    },
  });
};

export const useUpdateLogoById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      shopService.updateLogoById(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop', variables.id] });
      showSuccess('Success', 'Logo updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update logo');
    },
  });
};

export const useCheckDeleteDependencies = () => {
  return useMutation<DeleteCheckResult, Error, string>({
    mutationFn: (id: string) => shopService.checkDeleteDependencies(id),
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopService.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      showSuccess('Success', 'Shop deleted successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to delete shop');
    },
  });
};

