import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";

export interface InvoiceItem {
  itemType: 'product' | 'service' | 'manual';
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  shopId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  vehicleModel?: string;
  appointmentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  amountPaid?: number;
  paymentHistory?: any[];
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod?: 'cash' | 'upi' | 'card';
  qrCodeUrl?: string;
  createdAt: string;
}

interface FetchInvoicesParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useInvoices = (params?: FetchInvoicesParams) => {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/invoices", { params });
      return data.data; 
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/invoices/${id}`);
      return data.data as Invoice;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceData: Partial<Invoice>) => {
      const { data } = await axiosInstance.post("/invoices", invoiceData);
      return data.data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
      const response = await axiosInstance.patch(`/invoices/${id}`, data);
      return response.data.data as Invoice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] });
    },
  });
};

export const usePublicInvoice = (id: string) => {
  return useQuery({
    queryKey: ["public-invoice", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/public/invoices/${id}`);
      return data.data as Invoice;
    },
    enabled: !!id,
  });
};
