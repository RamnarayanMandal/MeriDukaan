import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";

export interface Service {
  _id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  estimatedDuration: number;
  isActive: boolean;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface FetchServicesParams {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const useServices = (params?: FetchServicesParams) => {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/services", { params });
      return data.data; // Assumes response is { data: { services, total, page, limit } }
    },
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/services/${id}`);
      return data.data as Service;
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
      const { data } = await axiosInstance.post("/services", serviceData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const response = await axiosInstance.put(`/services/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
