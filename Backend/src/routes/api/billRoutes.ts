import { Router } from 'express';
import { BillController } from '../../controllers/billController';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

// All bill routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.post('/', BillController.createBill);
router.get('/', BillController.getBills);
router.get('/number/:billNumber', BillController.getBillByNumber);
router.get('/:id', BillController.getBillById);
router.put('/:id', BillController.updateBill);
router.delete('/:id', BillController.deleteBill);

export default router;

