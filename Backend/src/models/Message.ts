import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatRoomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  senderRole: 'admin' | 'customer';
  content: string;
  attachments?: string[]; // URLs to images/files
  isRead: boolean;
  isEdited?: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['admin', 'customer'], required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  isRead: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false }
}, { timestamps: true });

MessageSchema.index({ chatRoomId: 1, createdAt: 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
