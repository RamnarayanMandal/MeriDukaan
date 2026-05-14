import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/analytics/dashboard");
      return data.data; 
    },
  });
};
