import { Router } from 'express';
import { AboutController } from '../../controllers/aboutController';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

// Get about (public or authenticated)
router.get('/', AboutController.getAbout);

// Update about (admin only)
router.use(authenticate);
router.use(requireAdmin);
router.put('/', AboutController.updateAbout);

export default router;

