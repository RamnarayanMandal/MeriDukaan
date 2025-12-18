import { z } from 'zod';

export const updateAboutSchema = z.object({
  shopDescription: z.string().min(1, 'Shop description is required').optional(),
  shopMission: z.string().optional(),
  ownerInfo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

