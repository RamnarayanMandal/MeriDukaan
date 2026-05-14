import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { notificationService } from './notification.service';

const getRecipientId = (req: Request): string => {
  // Works for both admin (req.user) and customer (req.customer) auth
  return (req as any).user?.userId || (req as any).customer?._id?.toString();
};

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = getRecipientId(req);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await notificationService.getForRecipient(recipientId, page, limit);
  res.json({ success: true, data: result });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = getRecipientId(req);
  const count = await notificationService.getUnreadCount(recipientId);
  res.json({ success: true, data: { count } });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = getRecipientId(req);
  const notification = await notificationService.markAsRead(req.params.id, recipientId);
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = getRecipientId(req);
  await notificationService.markAllAsRead(recipientId);
  res.json({ success: true, message: 'All notifications marked as read.' });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = getRecipientId(req);
  await notificationService.delete(req.params.id, recipientId);
  res.json({ success: true, message: 'Notification deleted.' });
});
