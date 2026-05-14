import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { invoiceValidation } from './invoice.validation';

const router = Router();

router.use(authenticate, requireAdmin);

router.post(
  '/',
  validateRequest(invoiceValidation.create),
  InvoiceController.create
);

router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);

router.patch(
  '/:id',
  validateRequest(invoiceValidation.create.partial()),
  InvoiceController.update
);

router.delete('/:id', InvoiceController.delete);

export default router;
