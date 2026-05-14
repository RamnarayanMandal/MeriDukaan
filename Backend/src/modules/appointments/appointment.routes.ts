import { Router } from 'express';
import { AppointmentController } from './appointment.controller';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { appointmentValidation } from './appointment.validation';

const router = Router();

// Public route for booking
router.post(
  '/',
  validateRequest(appointmentValidation.create),
  AppointmentController.create
);

// Admin routes
router.get(
  '/',
  authenticate,
  AppointmentController.getAll
);

router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validateRequest(appointmentValidation.updateStatus),
  AppointmentController.updateStatus
);

export default router;
