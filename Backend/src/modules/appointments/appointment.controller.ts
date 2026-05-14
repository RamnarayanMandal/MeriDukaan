import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { AppointmentModuleService } from './appointment.service';

const appointmentService = new AppointmentModuleService();

export const AppointmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.createAppointment(req.body);
    ResponseHandler.created(res, 'Appointment booked successfully', appointment);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    const query = { ...req.query };

    // If customer, force filter by their own ID
    if (role === 'customer') {
      query.customerId = userId;
    }

    const { appointments, total, page, limit } = await appointmentService.getAllAppointments(query);
    ResponseHandler.paginated(res, 'Appointments retrieved successfully', appointments, page, limit, total);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status, assignedMechanic } = req.body;
    const appointment = await appointmentService.updateStatus(req.params.id, status, assignedMechanic);
    ResponseHandler.success(res, 'Appointment status updated successfully', appointment);
  }),
};
