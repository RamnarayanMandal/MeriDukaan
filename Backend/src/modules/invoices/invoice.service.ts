import mongoose from 'mongoose';
import Invoice, { IInvoice } from '../../models/Invoice';
import { Product } from '../../models/Product';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/errorHandler';
import { Shop } from '../../models/Shop'; // Assuming this exists

export class InvoiceModuleService {
  
  async createInvoice(invoiceData: any): Promise<IInvoice> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Calculate totals
      let subtotal = 0;
      const calculatedItems = invoiceData.items.map((item: any) => {
        const amount = item.quantity * item.rate;
        subtotal += amount;
        return { ...item, amount };
      });

      const discountAmount = invoiceData.discount || 0;
      const afterDiscount = subtotal - discountAmount;
      
      const gstRate = invoiceData.gstRate || 0;
      const gstAmount = (afterDiscount * gstRate) / 100;
      
      const grandTotal = Math.round(afterDiscount + gstAmount);

      // 2. Generate Invoice Number
      // Using 'Invoice.generateInvoiceNumber' statics
      const InvoiceModel = Invoice as any;
      const invoiceNumber = await InvoiceModel.generateInvoiceNumber(invoiceData.shopId);

      // 3. Create Invoice
      const invoice = new Invoice({
        ...invoiceData,
        items: calculatedItems,
        invoiceNumber,
        subtotal,
        discount: discountAmount,
        gstRate,
        gstAmount,
        grandTotal,
        amountPaid: invoiceData.amountPaid || 0,
        paymentHistory: (invoiceData.amountPaid || 0) > 0 ? [{
          amount: invoiceData.amountPaid,
          method: invoiceData.paymentMethod || 'cash',
          date: new Date(),
          note: 'Initial payment'
        }] : []
      });

      await invoice.save({ session });

      // 4. Handle Inventory Auto-Reduction
      for (const item of calculatedItems) {
        if (item.itemType === 'product' && item.productId) {
          const product = await Product.findById(item.productId).session(session);
          if (product) {
            if (product.stockQty < item.quantity) {
              throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }
            product.stockQty -= item.quantity;
            await product.save({ session });
          }
        }
      }

      // 5. Update Customer CRM
      const amountDue = grandTotal - (invoiceData.amountPaid || 0);
      let customer = await User.findOne({ phoneNumber: invoiceData.customerPhone }).session(session);
      if (customer) {
        customer.totalVisits += 1;
        customer.lastServiceDate = new Date();
        if (invoiceData.vehicleModel && !customer.bikeModel.includes(invoiceData.vehicleModel)) {
          customer.bikeModel.push(invoiceData.vehicleModel);
        }
        if (amountDue > 0) {
          customer.pendingPayments += amountDue; 
        }
        await customer.save({ session });
        invoice.customerId = customer._id;
        await invoice.save({ session });
      } else {
        const newCustomer = await User.create([{
          firstName: invoiceData.customerName,
          phoneNumber: invoiceData.customerPhone,
          bikeModel: invoiceData.vehicleModel ? [invoiceData.vehicleModel] : [],
          totalVisits: 1,
          lastServiceDate: new Date(),
          pendingPayments: amountDue > 0 ? amountDue : 0,
          role: 'customer'
        }], { session });
        invoice.customerId = newCustomer[0]._id;
        await invoice.save({ session });
      }

      // 6. Generate UPI QR Code URL (Generic format)
      // upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
      // In a real scenario, shop's UPI ID would be fetched. Here we mock it.
      const shop = await Shop.findById(invoiceData.shopId).session(session);
      const upiId = shop?.upiId || '7827871342@ybl'; // Default fallback based on garage phone
      invoice.qrCodeUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(invoiceData.customerName)}&am=${grandTotal}&cu=INR`;
      await invoice.save({ session });

      await session.commitTransaction();

      // Invalidate Dashboard Cache
      const { CacheService } = await import('../../shared/cache/cache.service');
      await CacheService.delete(`dashboard:${invoiceData.shopId}`);
      await CacheService.invalidatePattern(`invoices:${invoiceData.shopId}:*`);

      return invoice;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllInvoices(query: any): Promise<{ invoices: any[], total: number, page: number, limit: number, meta: any }> {
    const { page = 1, limit = 10, search, status, shopId } = query;
    
    // Check Cache
    const cacheKey = `invoices:${shopId || 'all'}:${page}:${limit}:${search || ''}:${status || ''}`;
    const { CacheService } = await import('../../shared/cache/cache.service');
    const cachedData = await CacheService.get<any>(cacheKey);
    if (cachedData) return cachedData;

    const filter: any = {};
    if (shopId) filter.shopId = shopId;
    if (status) filter.paymentStatus = status;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const { PaginationUtil } = await import('../../shared/pagination/pagination.util');
    const paginatedResult = await PaginationUtil.paginate(Invoice, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 }
    });

    const result = {
      invoices: paginatedResult.data,
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
      meta: paginatedResult.meta
    };

    // Cache for 10 minutes
    await CacheService.set(cacheKey, result, 600);

    return result;
  }

  async getInvoiceById(id: string): Promise<IInvoice> {
    const invoice = await Invoice.findById(id).populate('items.productId').populate('items.serviceId');
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }
    return invoice;
  }

  async updateInvoice(id: string, updateData: any): Promise<IInvoice> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const oldInvoice = await Invoice.findById(id).session(session);
      if (!oldInvoice) throw new AppError('Invoice not found', 404);

      // 1. Restore Inventory
      for (const item of oldInvoice.items) {
        if (item.itemType === 'product' && item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: item.quantity } }).session(session);
        }
      }

      // 2. Recalculate Totals
      let subtotal = 0;
      const calculatedItems = updateData.items.map((item: any) => {
        const amount = item.quantity * item.rate;
        subtotal += amount;
        return { ...item, amount };
      });

      const discountAmount = updateData.discount || 0;
      const afterDiscount = subtotal - discountAmount;
      const gstRate = updateData.gstRate || 0;
      const gstAmount = (afterDiscount * gstRate) / 100;
      const grandTotal = Math.round(afterDiscount + gstAmount);

      // 3. Update Invoice
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, {
        ...updateData,
        items: calculatedItems,
        subtotal,
        discount: discountAmount,
        gstRate,
        gstAmount,
        grandTotal,
      }, { new: true, session });

      // 4. Reduce New Inventory
      for (const item of calculatedItems) {
        if (item.itemType === 'product' && item.productId) {
          const product = await Product.findById(item.productId).session(session);
          if (product) {
            if (product.stockQty < item.quantity) {
              throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }
            product.stockQty -= item.quantity;
            await product.save({ session });
          }
        }
      }

      await session.commitTransaction();
      
      // Invalidate Patterns
      const { CacheService } = await import('../../shared/cache/cache.service');
      await CacheService.invalidatePattern(`invoices:${oldInvoice.shopId}:*`);
      
      return updatedInvoice!;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findById(id).session(session);
      if (!invoice) throw new AppError('Invoice not found', 404);

      // Restore Inventory
      for (const item of invoice.items) {
        if (item.itemType === 'product' && item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockQty: item.quantity } }).session(session);
        }
      }

      await Invoice.findByIdAndDelete(id).session(session);
      await session.commitTransaction();
      
      const { CacheService } = await import('../../shared/cache/cache.service');
      await CacheService.invalidatePattern(`invoices:${invoice.shopId}:*`);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
