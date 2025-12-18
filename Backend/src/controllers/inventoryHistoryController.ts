import { Request, Response } from 'express';
import { InventoryHistoryService } from '../services/inventoryHistoryService';
import { ResponseHandler } from '../utils/responseHandler';

export class InventoryHistoryController {
  static async getHistory(req: Request, res: Response) {
    try {
      const {
        shopId,
        productId,
        fromDate,
        toDate,
        month,
        year,
        page,
        limit,
      } = req.query;

      if (!shopId || typeof shopId !== 'string') {
        return ResponseHandler.error(res, 'shopId is required', 400);
      }

      const result = await InventoryHistoryService.getHistory({
        shopId,
        productId: typeof productId === 'string' ? productId : undefined,
        fromDate: typeof fromDate === 'string' ? fromDate : undefined,
        toDate: typeof toDate === 'string' ? toDate : undefined,
        month:
          typeof month === 'string' && month
            ? Number.parseInt(month, 10)
            : undefined,
        year:
          typeof year === 'string' && year
            ? Number.parseInt(year, 10)
            : undefined,
        page:
          typeof page === 'string' && page
            ? Number.parseInt(page, 10)
            : undefined,
        limit:
          typeof limit === 'string' && limit
            ? Number.parseInt(limit, 10)
            : undefined,
      });

      return ResponseHandler.success(
        res,
        'Inventory history retrieved successfully',
        result
      );
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }
}


