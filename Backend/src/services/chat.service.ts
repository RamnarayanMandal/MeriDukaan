import ChatRoom, { IChatRoom } from '../models/ChatRoom';
import Message, { IMessage } from '../models/Message';
import Appointment from '../models/Appointment';
import { SocketService } from '../socket/socket.service';
import { NotificationService } from './notification.service';
import mongoose from 'mongoose';

export class ChatService {
  public static async getOrCreateRoom(appointmentId: string): Promise<IChatRoom> {
    const appointment = await Appointment.findById(appointmentId).populate('shopId');
    if (!appointment) throw new Error('Appointment not found');

    let room = await ChatRoom.findOne({ appointmentId: new mongoose.Types.ObjectId(appointmentId) });

    if (!room) {
      room = await ChatRoom.create({
        appointmentId: appointment._id,
        shopId: appointment.shopId,
        customerId: appointment.customerId,
        adminId: (appointment as any).shopId.owner, // Assuming shop owner is the default admin for chat
        unreadCount: { customer: 0, admin: 0 },
        isActive: true
      });
    }

    return room;
  }

  public static async getOrCreateCustomerRoom(customerId: string, shopId: string): Promise<IChatRoom> {
    // Look for a room for this customer that doesn't have an appointmentId (general support)
    let room = await ChatRoom.findOne({
      customerId: new mongoose.Types.ObjectId(customerId),
      appointmentId: { $exists: false }
    });

    if (!room) {
      const Shop = mongoose.model('Shop');
      const shop = await Shop.findById(shopId);
      if (!shop) throw new Error('Shop not found');

      room = await ChatRoom.create({
        shopId: new mongoose.Types.ObjectId(shopId),
        customerId: new mongoose.Types.ObjectId(customerId),
        adminId: (shop as any).owner,
        unreadCount: { customer: 0, admin: 0 },
        isActive: true
      });
    }

    return room;
  }

  public static async sendMessage(data: {
    chatRoomId: string;
    senderId: string;
    senderRole: 'admin' | 'customer';
    content: string;
    attachments?: string[];
  }): Promise<IMessage> {
    const room = await ChatRoom.findById(data.chatRoomId);
    if (!room) throw new Error('Chat room not found');

    const recipientId = data.senderRole === 'customer' ? room.adminId : room.customerId;

    const message = await Message.create({
      chatRoomId: new mongoose.Types.ObjectId(data.chatRoomId),
      senderId: new mongoose.Types.ObjectId(data.senderId),
      recipientId,
      senderRole: data.senderRole,
      content: data.content,
      attachments: data.attachments,
      isRead: false
    });

    // Update room's last message and unread count
    const updateData: any = { lastMessage: message._id };
    if (data.senderRole === 'customer') {
      updateData.$inc = { 'unreadCount.admin': 1 };
    } else {
      updateData.$inc = { 'unreadCount.customer': 1 };
    }

    await ChatRoom.findByIdAndUpdate(data.chatRoomId, updateData);

    // Emit socket event to the room
    SocketService.sendToChat(data.chatRoomId, 'new_message', message);

    // Send notification to the other party
    const recipientIdStr = recipientId.toString();
    const recipientRole = data.senderRole === 'customer' ? 'admin' : 'customer';

    await NotificationService.createNotification({
      recipientId: recipientIdStr,
      recipientRole,
      type: 'chat_message',
      title: 'New Message',
      message: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
      relatedChatRoomId: data.chatRoomId,
      relatedAppointmentId: room.appointmentId?.toString()
    });

    return message;
  }

  public static async getMessages(chatRoomId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    return await Message.find({ chatRoomId: new mongoose.Types.ObjectId(chatRoomId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  public static async markRoomAsRead(chatRoomId: string, role: 'admin' | 'customer'): Promise<void> {
    const updateData: any = {};
    if (role === 'admin') {
      updateData['unreadCount.admin'] = 0;
    } else {
      updateData['unreadCount.customer'] = 0;
    }

    await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);

    // Also mark individual messages as read (optional optimization: only those sent by other party)
    const senderRoleToMark = role === 'admin' ? 'customer' : 'admin';
    await Message.updateMany(
      { chatRoomId: new mongoose.Types.ObjectId(chatRoomId), senderRole: senderRoleToMark, isRead: false },
      { isRead: true }
    );
  }

  public static async getCustomerRooms(customerId: string): Promise<IChatRoom[]> {
    return await ChatRoom.find({ customerId: new mongoose.Types.ObjectId(customerId) })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  }

  public static async getAdminRooms(adminId: string): Promise<IChatRoom[]> {
    return await ChatRoom.find({ adminId: new mongoose.Types.ObjectId(adminId) })
      .populate('lastMessage')
      .populate('customerId', 'firstName lastName profilePicture')
      .sort({ updatedAt: -1 });
  }

  public static async updateMessage(
    messageId: string,
    requesterId: string,
    newContent: string
  ): Promise<IMessage> {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');

    // Only sender can edit
    if (message.senderId.toString() !== requesterId) {
      throw new Error('You can only edit your own messages');
    }

    // Within 30 minutes
    const ageMs = Date.now() - new Date(message.createdAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      throw new Error('Messages can only be edited within 30 minutes of sending');
    }

    message.content = newContent;
    (message as any).isEdited = true;
    await message.save();

    // Broadcast update
    SocketService.sendToChat(message.chatRoomId.toString(), 'message_updated', message);

    return message;
  }

  public static async deleteMessage(
    messageId: string,
    requesterId: string,
    requesterRole: 'admin' | 'customer'
  ): Promise<void> {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');

    const isAdmin = requesterRole === 'admin';
    const isOwner = message.senderId.toString() === requesterId;

    if (!isAdmin && !isOwner) {
      throw new Error('You can only delete your own messages');
    }

    // Customers have 30-min window; admins have no restriction
    if (!isAdmin) {
      const ageMs = Date.now() - new Date(message.createdAt).getTime();
      if (ageMs > 30 * 60 * 1000) {
        throw new Error('Messages can only be deleted within 30 minutes of sending');
      }
    }

    const chatRoomId = message.chatRoomId.toString();
    await Message.findByIdAndDelete(messageId);

    // Broadcast deletion so all clients remove the bubble instantly
    SocketService.sendToChat(chatRoomId, 'message_deleted', { messageId });
  }
}
