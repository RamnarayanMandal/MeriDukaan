import { z } from 'zod';

export const updateShopSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required').optional(),
  address: z.string().optional(),
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  mobileNumbers: z.array(z.string().min(1, 'Mobile number is required')).min(1, 'At least one mobile number is required').optional(),
  gstNo: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

