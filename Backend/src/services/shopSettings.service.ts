import { ShopSettings, IShopSettings } from '../models/ShopSettings';
import { CacheService } from '../shared/cache/cache.service';
import { AppError } from '../middlewares/errorHandler';
import { DEFAULT_SHOP_SETTINGS } from '../config/defaultSettings';

export class ShopSettingsService {
  /**
   * Get settings with cache
   */
  static async getSettings(shopId: string): Promise<IShopSettings> {
    const cacheKey = `settings:${shopId}`;
    const cachedSettings = await CacheService.get<IShopSettings>(cacheKey);
    
    if (cachedSettings) return cachedSettings;

    // Handle 'default' or invalid IDs
    const mongoose = await import('mongoose');
    let targetShopId = shopId;
    
    if (shopId === 'default' || !mongoose.Types.ObjectId.isValid(shopId)) {
      const { Shop } = await import('../models/Shop');
      const firstShop = await Shop.findOne().sort({ createdAt: 1 });
      if (firstShop) {
        targetShopId = firstShop._id.toString();
      } else {
        // If no shop exists at all, we return the static default config wrapped in a mock object
        return DEFAULT_SHOP_SETTINGS as any;
      }
    }

    let settings = await ShopSettings.findOne({ shopId: targetShopId }).lean();
    
    if (!settings) {
      settings = await ShopSettings.create({
        shopId: targetShopId,
        ...DEFAULT_SHOP_SETTINGS
      }) as any;
    }

    // Cache for 12 hours
    await CacheService.set(cacheKey, settings, 43200);

    return settings as IShopSettings;
  }

  /**
   * Update settings and invalidate cache
   */
  static async updateSettings(shopId: string, data: Partial<IShopSettings>): Promise<IShopSettings> {
    const mongoose = await import('mongoose');
    let targetShopId = shopId;

    if (shopId === 'default' || !mongoose.Types.ObjectId.isValid(shopId)) {
      const { Shop } = await import('../models/Shop');
      const firstShop = await Shop.findOne().sort({ createdAt: 1 });
      if (firstShop) {
        targetShopId = firstShop._id.toString();
      } else {
        throw new AppError('Invalid Shop ID for settings update', 400);
      }
    }

    const settings = await ShopSettings.findOneAndUpdate(
      { shopId: targetShopId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );

    await CacheService.delete(`settings:${shopId}`);
    
    return settings;
  }
}
