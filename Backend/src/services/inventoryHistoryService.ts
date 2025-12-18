import { InventoryHistory } from '../models/InventoryHistory';
import mongoose from 'mongoose';

interface InventoryHistoryFilters {
  shopId: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export class InventoryHistoryService {
  static async getHistory(filters: InventoryHistoryFilters) {
    const {
      shopId,
      productId,
      fromDate,
      toDate,
      month,
      year,
      page = 1,
      limit = 10,
    } = filters;

    const query: any = {
      shopId: new mongoose.Types.ObjectId(shopId),
    };

    if (productId) {
      query.productId = new mongoose.Types.ObjectId(productId);
    }

    // date filters
    if (fromDate || toDate || month || year) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);

      if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
      } else if (year && !month) {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };
      }
    }

    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;

    const [items, totalCount] = await Promise.all([
      InventoryHistory.find(query)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .populate('productId', 'name productCode'),
      InventoryHistory.countDocuments(query),
    ]);

    return {
      items,
      page: safePage,
      limit: safeLimit,
      totalCount,
    };
  }
}


