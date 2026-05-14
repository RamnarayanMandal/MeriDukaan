"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SHOP_SETTINGS, ShopSettings } from "@/config/defaultShopSettings";
import { useShopSettings } from "@/hooks/useShopSettings";

interface ShopSettingsContextType {
  settings: ShopSettings;
  isLoading: boolean;
  isError: boolean;
}

const ShopSettingsContext = createContext<ShopSettingsContextType>({
  settings: DEFAULT_SHOP_SETTINGS,
  isLoading: true,
  isError: false,
});

export const ShopSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We use the hook which already handles the API call to /shop-settings/default (or specific shop)
  const { data: apiSettings, isLoading, isError } = useShopSettings();
  
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);

  useEffect(() => {
    if (apiSettings) {
      // Merge API settings with defaults to ensure all fields exist
      setSettings({
        ...DEFAULT_SHOP_SETTINGS,
        ...apiSettings,
        themeColors: {
          ...DEFAULT_SHOP_SETTINGS.themeColors,
          ...apiSettings.themeColors,
        },
        socialLinks: {
          ...DEFAULT_SHOP_SETTINGS.socialLinks,
          ...apiSettings.socialLinks,
        },
      });
    }
  }, [apiSettings]);

  return (
    <ShopSettingsContext.Provider value={{ settings, isLoading, isError }}>
      {children}
    </ShopSettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(ShopSettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a ShopSettingsProvider");
  }
  return context;
};
