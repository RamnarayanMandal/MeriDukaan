import { z } from 'zod';

const billItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be 0 or greater'),
});

export const createBillSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  billDate: z.coerce.date().optional(),
  items: z.array(billItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0, 'Tax must be 0 or greater').optional(),
  shopId: z.string().optional(),
});

export const updateBillSchema = createBillSchema.partial().extend({
  items: z.array(billItemSchema).min(1, 'At least one item is required').optional(),
});

export const getBillsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  customerName: z.string().optional(),
});

