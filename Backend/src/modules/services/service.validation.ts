import { z } from 'zod';

export const serviceValidation = {
  create: z.object({
    body: z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      category: z.enum(['General', 'Engine', 'Washing', 'Brakes', 'Electrical', 'Tires', 'Body', 'Other']),
      description: z.string().optional(),
      basePrice: z.number().min(0, "Price must be positive"),
      estimatedDuration: z.number().min(5, "Duration must be at least 5 minutes"),
      isActive: z.boolean().optional(),
      image: z.string().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      category: z.enum(['General', 'Engine', 'Washing', 'Brakes', 'Electrical', 'Tires', 'Body', 'Other']).optional(),
      description: z.string().optional(),
      basePrice: z.number().min(0).optional(),
      estimatedDuration: z.number().min(5).optional(),
      isActive: z.boolean().optional(),
      image: z.string().optional(),
    }),
  }),
};
