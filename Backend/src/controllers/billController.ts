import { Request, Response } from 'express';
import { BillService } from '../services/billService';
import {
  createBillSchema,
  updateBillSchema,
  getBillsQuerySchema,
} from '../validations/billValidation';
import { ResponseHandler } from '../utils/responseHandler';

export class BillController {
  /**
   * Create a new bill
   */
  static async createBill(req: Request, res: Response) {
    try {
      const validatedData = createBillSchema.parse(req.body);
      // Ensure billDate is set (default to today if not provided)
      const billData = {
        ...validatedData,
        billDate: validatedData.billDate || new Date(),
      };
      const bill = await BillService.createBill(billData);
      return ResponseHandler.success(res, 'Bill created successfully', bill, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get all bills
   */
  static async getBills(req: Request, res: Response) {
    try {
      const filters = getBillsQuerySchema.parse(req.query);
      const bills = await BillService.getBills(filters);
      return ResponseHandler.success(res, 'Bills retrieved successfully', bills);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get bill by ID
   */
  static async getBillById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bill = await BillService.getBillById(id);
      
      if (!bill) {
        return ResponseHandler.error(res, 'Bill not found', 404);
      }
      
      return ResponseHandler.success(res, 'Bill retrieved successfully', bill);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Get bill by bill number
   */
  static async getBillByNumber(req: Request, res: Response) {
    try {
      const { billNumber } = req.params;
      const bill = await BillService.getBillByNumber(billNumber);
      
      if (!bill) {
        return ResponseHandler.error(res, 'Bill not found', 404);
      }
      
      return ResponseHandler.success(res, 'Bill retrieved successfully', bill);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update bill
   */
  static async updateBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateBillSchema.parse(req.body);
      const bill = await BillService.updateBill(id, validatedData);
      
      if (!bill) {
        return ResponseHandler.error(res, 'Bill not found', 404);
      }
      
      return ResponseHandler.success(res, 'Bill updated successfully', bill);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Delete bill
   */
  static async deleteBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await BillService.deleteBill(id);
      
      if (!deleted) {
        return ResponseHandler.error(res, 'Bill not found', 404);
      }
      
      return ResponseHandler.success(res, 'Bill deleted successfully', null);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }
}

