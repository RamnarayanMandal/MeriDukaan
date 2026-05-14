import express from 'express';
import { InvoiceController } from '../../modules/invoices/invoice.controller';

const router = express.Router();

// Public route to view a single invoice
// Note: We use the same controller method, which just fetches by ID.
// No auth middleware here.
router.get('/invoices/:id', InvoiceController.getById);

export default router;
