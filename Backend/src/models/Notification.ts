import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'booking_new'
  | 'status_update'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'bike_ready'
  | 'chat_message'
  | 'general';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientRole: 'admin' | 'customer';
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedAppointmentId?: mongoose.Types.ObjectId;
  relatedChatRoomId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientRole' },
  recipientRole: { type: String, enum: ['admin', 'customer'], required: true },
  type: {
    type: String,
    enum: ['booking_new', 'status_update', 'booking_confirmed', 'booking_cancelled', 'bike_ready', 'chat_message', 'general'],
    default: 'general',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  relatedChatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom' },
}, { timestamps: true });

// Indexes for fast querying
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
