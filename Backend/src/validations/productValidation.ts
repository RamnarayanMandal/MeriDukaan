import { z } from 'zod';
import { ProductCategory, ProductUnit } from '../models/Product';

export const createProductSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Product category is required').trim(),
  productCode: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().min(1, 'Barcode is required'),
  brand: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  stockQty: z.number().min(0, 'Stock quantity must be 0 or greater').default(0),
  unit: z.nativeEnum(ProductUnit),
  description: z.string().optional(),
  gstRate: z.number().optional(),
  images: z.array(z.object({
    fileId: z.string(),
    url: z.string(),
    isThumbnail: z.boolean().optional(),
  })).optional(),
  thumbnailImage: z.object({
    fileId: z.string(),
    url: z.string(),
    isThumbnail: z.boolean().optional(),
  }).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  shopId: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

