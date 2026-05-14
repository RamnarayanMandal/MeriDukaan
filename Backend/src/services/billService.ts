import { Bill, IBill, IBillItem } from '../models/Bill';
import { Product } from '../models/Product';
import { InventoryService } from './inventoryService';
import { numberToWords } from '../utils/numberToWords';
import mongoose from 'mongoose';

export interface CreateBillData {
  shopId: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate: Date;
  items: Array<{
    productId: string;
    quantity: number;
    rate: number;
  }>;
  tax?: number;
}

export interface UpdateBillData {
  shopId?: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate?: Date;
  items?: Array<{
    productId: string;
    quantity: number;
    rate: number;
  }>;
  tax?: number;
}

export class BillService {
  /**
   * Create a new bill
   */
  static async createBill(data: CreateBillData): Promise<IBill> {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Generate bill number
    const billNumber = await (Bill as any).generateBillNumber();

    try {
      // Calculate items and totals
      const { items, subtotal, grandTotal } = await this.calculateBillItems(
        data.items,
        data.shopId
      );

      const finalGrandTotal = grandTotal + (data.tax || 0);

      // Create bill
      const [bill] = await Bill.create(
        [
          {
            shopId: new mongoose.Types.ObjectId(data.shopId),
            billNumber,
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            customerPhone: data.customerPhone,
            billDate: data.billDate || new Date(),
            items,
            subtotal,
            tax: data.tax || 0,
            grandTotal: finalGrandTotal,
            amountInWords: numberToWords(finalGrandTotal),
          },
        ],
        { session }
      );

      // Update stock for each product & create inventory history
      for (const item of data.items) {
        await InventoryService.updateStock(
          item.productId,
          -item.quantity,
          'SALE',
          (bill as any)._id.toString()
        );
      }

      await session.commitTransaction();
      await session.endSession();

      return bill.populate('items.product');
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  /**
   * Get all bills
   */
  static async getBills(filters?: {
    shopId?: string;
    startDate?: Date;
    endDate?: Date;
    customerName?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: IBill[];
    page: number;
    limit: number;
    totalCount: number;
  }> {
    const query: any = {};

    if (filters?.shopId) {
      query.shopId = new mongoose.Types.ObjectId(filters.shopId);
    }

    if (filters?.startDate || filters?.endDate) {
      query.billDate = {};
      if (filters.startDate) {
        query.billDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.billDate.$lte = filters.endDate;
      }
    }
    
    if (filters?.customerName) {
      query.customerName = { $regex: filters.customerName, $options: 'i' };
    }

    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;

    const [items, totalCount] = await Promise.all([
      Bill.find(query)
        .populate('items.product')
        .sort({ billDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Bill.countDocuments(query),
    ]);

    return { items, page, limit, totalCount };
  }

  /**
   * Get bill by ID
   */
  static async getBillById(id: string): Promise<IBill | null> {
    return await Bill.findById(id).populate('items.product');
  }

  /**
   * Get bill by bill number
   */
  static async getBillByNumber(billNumber: string): Promise<IBill | null> {
    return await Bill.findOne({ billNumber }).populate('items.product');
  }

  /**
   * Update bill
   */
  static async updateBill(
    id: string,
    data: UpdateBillData
  ): Promise<IBill | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingBill = await Bill.findById(id)
        .populate('items.product')
        .session(session);
      if (!existingBill) {
        throw new Error('Bill not found');
      }

      const shopId = (existingBill.shopId || data.shopId) as any;

      // Prepare old quantities per product
      const oldMap = new Map<string, number>();
      for (const item of existingBill.items) {
        const productId = ((item.product as any)._id || item.product).toString();
        oldMap.set(productId, (oldMap.get(productId) || 0) + item.quantity);
      }

      // New items list
      const itemsToProcess =
        data.items ||
        existingBill.items.map((item: any) => ({
          productId: (item.product._id || item.product).toString(),
          quantity: item.quantity,
          rate: item.rate,
        }));

      const newMap = new Map<string, number>();
      for (const item of itemsToProcess) {
        newMap.set(
          item.productId,
          (newMap.get(item.productId) || 0) + item.quantity
        );
      }

      // For each product, compute delta = newQty - oldQty
      const allProductIds = new Set<string>([
        ...Array.from(oldMap.keys()),
        ...Array.from(newMap.keys()),
      ]);

      for (const productId of allProductIds) {
        const prevQty = oldMap.get(productId) || 0;
        const newQty = newMap.get(productId) || 0;
        const delta = newQty - prevQty;

        if (delta !== 0) {
          // negative delta -> add stock back, positive delta -> reduce more stock
          await InventoryService.updateStock(
            productId,
            -delta, // invert: we store inventory change as stock movement
            'BILL_EDIT',
            id
          );
        }
      }

      const { items, subtotal, grandTotal } = await this.calculateBillItems(
        itemsToProcess,
        shopId.toString()
      );

      const finalTax =
        data.tax !== undefined ? data.tax : existingBill.tax || 0;
      const finalGrandTotal = grandTotal + finalTax;

      const updatedBill = await Bill.findByIdAndUpdate(
        id,
        {
          $set: {
            customerName: data.customerName ?? existingBill.customerName,
            customerAddress:
              data.customerAddress ?? existingBill.customerAddress,
            customerPhone: data.customerPhone ?? existingBill.customerPhone,
            billDate: data.billDate ?? existingBill.billDate,
            items,
            subtotal,
            tax: finalTax,
            grandTotal: finalGrandTotal,
            amountInWords: numberToWords(finalGrandTotal),
          },
        },
        { new: true, runValidators: true }
      ).session(session);

      await session.commitTransaction();
      await session.endSession();

      return updatedBill?.populate('items.product') || null;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  /**
   * Delete bill
   */
  static async deleteBill(id: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bill = await Bill.findById(id).populate('items.product').session(session);
      if (!bill) {
        await session.abortTransaction();
        await session.endSession();
        return false;
      }

      // restore stock for each item
      for (const item of bill.items) {
        const productId = (item.product as any)._id || item.product;
        await InventoryService.updateStock(
          productId.toString(),
          item.quantity,
          'DELETE',
          id
        );
      }

      await Bill.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      await session.endSession();
      return true;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  /**
   * Calculate bill items, subtotal, and grand total
   */
  private static async calculateBillItems(
    items: Array<{ productId: string; quantity: number; rate: number }>,
    shopId: string
  ): Promise<{
    items: IBillItem[];
    subtotal: number;
    grandTotal: number;
  }> {
    const billItems: IBillItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        shopId: new mongoose.Types.ObjectId(shopId),
      });
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const amount = item.quantity * item.rate;
      subtotal += amount;
      
      billItems.push({
        product: (product as any)._id,
        quantity: item.quantity,
        rate: item.rate,
        amount,
      });
    }
    
    return {
      items: billItems,
      subtotal,
      grandTotal: subtotal,
    };
  }
}

