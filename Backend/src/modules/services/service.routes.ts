import { Router } from 'express';
import { ServiceController } from './service.controller';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { serviceValidation } from './service.validation';

const router = Router();

// Public routes
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Admin only routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(serviceValidation.create),
  ServiceController.create
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateRequest(serviceValidation.update),
  ServiceController.update
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  ServiceController.delete
);

export default router;
