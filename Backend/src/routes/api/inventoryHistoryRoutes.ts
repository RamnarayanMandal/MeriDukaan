import { Router } from 'express';
import { InventoryHistoryController } from '../../controllers/inventoryHistoryController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, InventoryHistoryController.getHistory);

export default router;


