import { Request, Response } from 'express';
import { ShopService } from '../services/shopService';
import { updateShopSchema } from '../validations/shopValidation';
import { ResponseHandler } from '../utils/responseHandler';
import { GoogleDriveService } from '../services/googleDriveService';

export class ShopController {
  /**
   * Create shop (multi-shop) - owned by authenticated user
   */
  static async createShop(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      // Reuse update schema for now; mongoose will still enforce required fields
      const validatedData = updateShopSchema.parse(req.body);
      const shop = await ShopService.createShop(validatedData, userId);
      return ResponseHandler.success(res, 'Shop created successfully', shop);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get shop details (backward compatibility - returns first shop)
   */
  static async getShop(req: Request, res: Response) {
    try {
      const shop = await ShopService.getShop();
      return ResponseHandler.success(res, 'Shop details retrieved successfully', shop);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get all shops - only shops owned by authenticated user (with pagination)
   */
  static async getAllShops(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      // Extract pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await ShopService.getAllShops(userId, page, limit);
      return ResponseHandler.success(res, 'Shops retrieved successfully', result);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get shop by ID - only if owned by authenticated user
   */
  static async getShopById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      const { id } = req.params;
      const shop = await ShopService.getShopById(id, userId);
      
      if (!shop) {
        return ResponseHandler.error(res, 'Shop not found or you do not have access to it', 404);
      }
      
      return ResponseHandler.success(res, 'Shop details retrieved successfully', shop);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update shop details (backward compatibility)
   */
  static async updateShop(req: Request, res: Response) {
    try {
      const validatedData = updateShopSchema.parse(req.body);
      const shop = await ShopService.updateShop(validatedData);
      return ResponseHandler.success(res, 'Shop details updated successfully', shop);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update shop by ID - only if owned by authenticated user
   */
  static async updateShopById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      const { id } = req.params;
      const validatedData = updateShopSchema.parse(req.body);
      const shop = await ShopService.updateShopById(id, validatedData, userId);
      
      if (!shop) {
        return ResponseHandler.error(res, 'Shop not found or you do not have permission to update it', 404);
      }
      
      return ResponseHandler.success(res, 'Shop details updated successfully', shop);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update shop logo (backward compatibility)
   */
  static async updateLogo(req: Request, res: Response) {
    try {
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        return ResponseHandler.error(res, 'Logo file is required', 400);
      }

      const uploaded = await GoogleDriveService.uploadImage(file);

      const shop = await ShopService.updateLogo(uploaded);
      return ResponseHandler.success(res, 'Logo updated successfully', shop);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update shop logo by ID - only if owned by authenticated user
   */
  static async updateLogoById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      const { id } = req.params;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        return ResponseHandler.error(res, 'Logo file is required', 400);
      }

      const uploaded = await GoogleDriveService.uploadImage(file);

      const shop = await ShopService.updateLogoById(id, uploaded, userId);
      
      if (!shop) {
        return ResponseHandler.error(res, 'Shop not found or you do not have permission to update it', 404);
      }
      
      return ResponseHandler.success(res, 'Logo updated successfully', shop);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Check delete dependencies for a shop - only if owned by authenticated user
   */
  static async checkDeleteDependencies(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      const { id } = req.params;
      const result = await ShopService.checkDeleteDependencies(id, userId);
      return ResponseHandler.success(res, 'Delete check completed', result);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Delete shop by ID - only if owned by authenticated user
   */
  static async deleteShop(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return ResponseHandler.error(res, 'User not authenticated', 401);
      }

      const { id } = req.params;
      await ShopService.deleteShop(id, userId);
      return ResponseHandler.success(res, 'Shop deleted successfully', null);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 400);
    }
  }
}

