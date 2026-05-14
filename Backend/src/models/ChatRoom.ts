import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoom extends Document {
  appointmentId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId; // Assigned admin or shop owner
  lastMessage?: mongoose.Types.ObjectId;
  unreadCount: {
    customer: number;
    admin: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: false },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: {
    customer: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound index for finding existing rooms
ChatRoomSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });
ChatRoomSchema.index({ customerId: 1, shopId: 1, appointmentId: 1 }, { unique: true });

const ChatRoom = mongoose.models.ChatRoom || mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
export default ChatRoom;
