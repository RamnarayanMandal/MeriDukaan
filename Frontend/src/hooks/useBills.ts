import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  billService,
  GetBillsParams,
  PaginatedBills,
} from '@/service/billService';
import { Bill, CreateBillData, UpdateBillData } from '@/types/bill';
import { showSuccess, showError } from '@/lib/sweetAlert';

export const useBills = (params?: GetBillsParams) => {
  return useQuery<PaginatedBills>({
    queryKey: ['bills', params],
    queryFn: () => billService.getBills(params),
  });
};

export const useBill = (id: string) => {
  return useQuery<Bill>({
    queryKey: ['bill', id],
    queryFn: () => billService.getBillById(id),
    enabled: !!id,
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBillData) => billService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Update stock
      showSuccess('Success', 'Bill created successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to create bill');
    },
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillData }) =>
      billService.updateBill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Update stock
      showSuccess('Success', 'Bill updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update bill');
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billService.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Restore stock
      showSuccess('Success', 'Bill deleted successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to delete bill');
    },
  });
};

