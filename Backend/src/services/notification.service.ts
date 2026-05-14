import Notification, { INotification, NotificationType } from '../models/Notification';
import { SocketService } from '../socket/socket.service';
import mongoose from 'mongoose';

export class NotificationService {
  public static async createNotification(data: {
    recipientId: string;
    recipientRole: 'admin' | 'customer';
    type: NotificationType;
    title: string;
    message: string;
    relatedAppointmentId?: string;
    relatedChatRoomId?: string;
  }): Promise<INotification> {
    const notification = await Notification.create({
      recipientId: new mongoose.Types.ObjectId(data.recipientId),
      recipientRole: data.recipientRole,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedAppointmentId: data.relatedAppointmentId ? new mongoose.Types.ObjectId(data.relatedAppointmentId) : undefined,
      relatedChatRoomId: data.relatedChatRoomId ? new mongoose.Types.ObjectId(data.relatedChatRoomId) : undefined,
    });

    // Send realtime update
    SocketService.sendToUser(data.recipientId, 'new_notification', notification);
    
    if (data.recipientRole === 'admin') {
      SocketService.sendToAdmins('admin_notification_badge', { count: 1 });
    }

    return notification;
  }

  public static async getNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ recipientId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  public static async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  public static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipientId: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      recipientId: new mongoose.Types.ObjectId(userId),
      isRead: false
    });
  }
}
