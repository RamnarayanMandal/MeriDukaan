import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { AnalyticsService } from './analytics.service';
import mongoose from 'mongoose';

const analyticsService = new AnalyticsService();

export const AnalyticsController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    // Ideally from authenticated user/shop token
    // Using dummy shop ID for implementation logic, but parsing from context is standard
    let shopId = req.query.shopId as string;
    
    if (!shopId) {
      // Find a default shop if not provided just to ensure dashboard loads during dev
      const defaultShop = await mongoose.model('Shop').findOne();
      shopId = defaultShop?._id?.toString() || new mongoose.Types.ObjectId().toString();
    }
    
    const dashboardData = await analyticsService.getDashboardMetrics(shopId);
    ResponseHandler.success(res, 'Dashboard analytics retrieved', dashboardData);
  }),
};
