import express from 'express';
import { ShopSettingsController } from '../../controllers/shopSettings.controller';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = express.Router();

// Public route to get shop settings for frontend SEO and details
router.get('/:shopId', ShopSettingsController.getSettings);

// Protected admin route to update settings
router.put('/:shopId', authenticate, requireAdmin, ShopSettingsController.updateSettings);

export default router;
