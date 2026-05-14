import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { InvoiceModuleService } from './invoice.service';

const invoiceService = new InvoiceModuleService();

export const InvoiceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    // Extract shopId from user context or request body
    const userId = (req as any).user?.userId;
    
    // We should try to find the shop owned by this user
    const { Shop } = await import('../../models/Shop');
    const userShop = await Shop.findOne({ owner: userId });
    
    const shopId = req.body.shopId || userShop?._id;

    if (!shopId) {
      return ResponseHandler.error(res, 'Shop ID is required. Please ensure you have a shop created.', 400);
    }

    try {
      const invoice = await invoiceService.createInvoice({ ...req.body, shopId: shopId.toString() });
      ResponseHandler.created(res, 'Invoice generated successfully', invoice);
    } catch (error: any) {
      if (error.name === 'CastError') {
        return ResponseHandler.error(res, 'Invalid Shop ID provided', 400);
      }
      throw error;
    }
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { invoices, total, page, limit } = await invoiceService.getAllInvoices(req.query);
    ResponseHandler.paginated(res, 'Invoices retrieved successfully', invoices, page, limit, total);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    ResponseHandler.success(res, 'Invoice retrieved successfully', invoice);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    ResponseHandler.success(res, 'Invoice updated successfully', invoice);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await invoiceService.deleteInvoice(req.params.id);
    ResponseHandler.success(res, 'Invoice deleted successfully', null);
  }),
};
