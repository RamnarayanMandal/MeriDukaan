import { Router } from 'express';
import { InventoryHistoryController } from '../../controllers/inventoryHistoryController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, InventoryHistoryController.getHistory);

export default router;


