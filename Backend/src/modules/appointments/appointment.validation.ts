import { z } from 'zod';

export const appointmentValidation = {
  create: z.object({
    body: z.object({
      customerName: z.string().min(2, "Name must be at least 2 characters"),
      phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number format"),
      bikeModel: z.string().min(2, "Bike model is required"),
      serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid service ID"),
      shopId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid shop ID").optional(), // Optional if we fallback in service
      appointmentDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
      timeSlot: z.string().min(1, "Time slot is required"),
      issueDescription: z.string().optional(),
    }),
  }),
  updateStatus: z.object({
    body: z.object({
      status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']),
      assignedMechanic: z.string().optional(),
    }),
  }),
};
