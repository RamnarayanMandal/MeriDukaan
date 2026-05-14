import Notification, { NotificationType } from '../../models/Notification';
import mongoose from 'mongoose';

export class NotificationService {

  /** Create a notification and return it */
  async create(data: {
    recipientId: string;
    recipientRole: 'admin' | 'customer';
    type: NotificationType;
    title: string;
    message: string;
    relatedAppointmentId?: string;
    relatedChatRoomId?: string;
  }) {
    const notification = await Notification.create({
      ...data,
      recipientId: new mongoose.Types.ObjectId(data.recipientId),
      relatedAppointmentId: data.relatedAppointmentId
        ? new mongoose.Types.ObjectId(data.relatedAppointmentId)
        : undefined,
      relatedChatRoomId: data.relatedChatRoomId
        ? new mongoose.Types.ObjectId(data.relatedChatRoomId)
        : undefined,
    });
    return notification;
  }

  /** Get paginated notifications for a recipient */
  async getForRecipient(recipientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientId: new mongoose.Types.ObjectId(recipientId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId: new mongoose.Types.ObjectId(recipientId) }),
      Notification.countDocuments({
        recipientId: new mongoose.Types.ObjectId(recipientId),
        isRead: false,
      }),
    ]);
    return { notifications, total, unreadCount, page, limit };
  }

  /** Mark a single notification as read */
  async markAsRead(notificationId: string, recipientId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: new mongoose.Types.ObjectId(recipientId) },
      { isRead: true },
      { new: true }
    );
  }

  /** Mark all as read for a recipient */
  async markAllAsRead(recipientId: string) {
    return Notification.updateMany(
      { recipientId: new mongoose.Types.ObjectId(recipientId), isRead: false },
      { isRead: true }
    );
  }

  /** Get unread count only */
  async getUnreadCount(recipientId: string) {
    return Notification.countDocuments({
      recipientId: new mongoose.Types.ObjectId(recipientId),
      isRead: false,
    });
  }

  /** Delete a notification */
  async delete(notificationId: string, recipientId: string) {
    return Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: new mongoose.Types.ObjectId(recipientId),
    });
  }
}

export const notificationService = new NotificationService();
