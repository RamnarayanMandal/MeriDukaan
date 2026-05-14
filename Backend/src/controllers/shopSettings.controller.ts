import { Request, Response, NextFunction } from 'express';
import { ShopSettingsService } from '../services/shopSettings.service';

export class ShopSettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = req.params.shopId || req.user?.shopId; // Fallback to user's shop if authenticated
      if (!shopId) {
        return res.status(400).json({ success: false, message: 'Shop ID is required' });
      }

      const settings = await ShopSettingsService.getSettings(shopId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const shopId = req.params.shopId || req.user?.shopId;
      if (!shopId) {
        return res.status(400).json({ success: false, message: 'Shop ID is required' });
      }

      const settings = await ShopSettingsService.updateSettings(shopId, req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
}
