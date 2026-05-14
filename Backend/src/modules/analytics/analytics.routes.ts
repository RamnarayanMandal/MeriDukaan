import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, requireAdmin } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', AnalyticsController.getDashboard);

export default router;
