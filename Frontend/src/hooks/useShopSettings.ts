import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";
import { showSuccess, showError } from "@/lib/sweetAlert";

// Assume shopId is the first shop of the authenticated user for now
// In a full multi-tenant app, this would be dynamic
export const DEFAULT_SHOP_ID = "661234567890123456789012"; // Dummy or fetched ID

export const useShopSettings = (shopId: string = "default") => {
  return useQuery({
    queryKey: ["shopSettings", shopId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/shop-settings/${shopId}`);
      return data.data;
    },
    // Keep settings in stale state longer since they rarely change
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useUpdateShopSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const targetId = payload.shopId || "default";
      const { data } = await axiosInstance.put(`/shop-settings/${targetId}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shopSettings"] });
      showSuccess("Settings Updated", "Your shop settings have been saved successfully.");
    },
    onError: (error: any) => {
      showError("Error", error.response?.data?.message || "Failed to update settings");
    },
  });
};
