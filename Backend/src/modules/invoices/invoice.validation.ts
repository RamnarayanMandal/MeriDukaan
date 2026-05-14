import { z } from 'zod';

const invoiceItemSchema = z.object({
  itemType: z.enum(['product', 'service', 'manual']),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate cannot be negative"),
});

export const invoiceValidation = {
  create: z.object({
    body: z.object({
      shopId: z.string().optional(), // Injected from user token or body
      customerId: z.string().optional(),
      customerName: z.string().min(2, "Customer name is required"),
      customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone number required"),
      vehicleModel: z.string().optional(),
      appointmentId: z.string().optional(),
      
      items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
      
      discount: z.number().min(0).default(0),
      gstRate: z.number().min(0).default(0),
      notes: z.string().optional(),
      paymentStatus: z.enum(['pending', 'paid', 'partial']).default('pending'),
      paymentMethod: z.enum(['cash', 'upi', 'card']).optional(),
    }),
  }),
  updateStatus: z.object({
    body: z.object({
      paymentStatus: z.enum(['pending', 'paid', 'partial']),
      paymentMethod: z.enum(['cash', 'upi', 'card']).optional(),
    })
  })
};
