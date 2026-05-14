import axiosInstance from "@/lib/axiosClient";
import { DEFAULT_SHOP_SETTINGS, ShopSettings } from "@/config/defaultShopSettings";

export const shopSettingsService = {
  async getSettings(shopId: string = "default"): Promise<ShopSettings> {
    try {
      const { data } = await axiosInstance.get(`/shop-settings/${shopId}`);
      return data.data;
    } catch (error) {
      console.error("Error fetching shop settings:", error);
      return DEFAULT_SHOP_SETTINGS as any;
    }
  },

  async updateSettings(data: Partial<ShopSettings>, shopId: string = "default"): Promise<ShopSettings> {
    const { data: response } = await axiosInstance.patch(`/shop-settings/${shopId}`, data);
    return response.data;
  }
};
