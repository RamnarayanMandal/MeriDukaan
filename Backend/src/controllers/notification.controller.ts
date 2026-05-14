import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const notifications = await NotificationService.getNotifications(userId);
    const unreadCount = await NotificationService.getUnreadCount(userId);
    ResponseHandler.success(res, 'Notifications retrieved', { notifications, unreadCount });
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);
    ResponseHandler.success(res, 'Notification marked as read', notification);
  });

  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    await NotificationService.markAllAsRead(userId);
    ResponseHandler.success(res, 'All notifications marked as read');
  });

  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const count = await NotificationService.getUnreadCount(userId);
    ResponseHandler.success(res, 'Unread count retrieved', { count });
  });
}
