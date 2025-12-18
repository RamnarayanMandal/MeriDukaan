import { Router } from 'express';
import multer from 'multer';
import { ShopController } from '../../controllers/shopController';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';
import { upload } from '../../middlewares/multer';
    
const router = Router();

// All shop routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Backward compatibility routes (single shop)
router.get('/', ShopController.getShop);
router.put('/', ShopController.updateShop);
router.put(
    '/:id/logo',
    upload.single('logo'),
    ShopController.updateLogoById,
  );

// Multi-shop routes
router.post('/', ShopController.createShop);
router.get('/all', ShopController.getAllShops);
router.get('/:id', ShopController.getShopById);
router.put('/:id', ShopController.updateShopById);
router.get('/:id/check-delete', ShopController.checkDeleteDependencies);
router.delete('/:id', ShopController.deleteShop);

export default router;

