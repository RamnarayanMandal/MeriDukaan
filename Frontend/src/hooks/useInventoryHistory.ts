import { useQuery } from '@tanstack/react-query';
import {
  inventoryService,
  GetInventoryHistoryParams,
  PaginatedInventoryHistory,
} from '@/service/inventoryService';

export const useInventoryHistory = (params?: GetInventoryHistoryParams) => {
  return useQuery<PaginatedInventoryHistory>({
    queryKey: ['inventory-history', params],
    queryFn: () => {
      if (!params) {
        throw new Error('shopId is required');
      }
      return inventoryService.getHistory(params);
    },
    enabled: !!params?.shopId,
  });
};


