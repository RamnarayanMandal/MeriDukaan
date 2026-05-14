import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/authMiddleware';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller';

const router = Router();

// All notification routes require authentication (admin JWT)
router.use(AuthMiddleware.verifyToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
