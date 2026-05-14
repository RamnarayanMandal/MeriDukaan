import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { ChatService } from '../services/chat.service';

export class ChatController {
  static getOrCreateRoom = asyncHandler(async (req: Request, res: Response) => {
    const { appointmentId } = req.params;
    const room = await ChatService.getOrCreateRoom(appointmentId);
    ResponseHandler.success(res, 'Chat room retrieved', room);
  });

  static getOrCreateCustomerRoom = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { Shop } = await import('../models/Shop');
    const shop = await Shop.findOne() as InstanceType<typeof Shop> | null;
    if (!shop) throw new Error('Shop not found');

    const room = await ChatService.getOrCreateCustomerRoom(customerId, String(shop._id));
    ResponseHandler.success(res, 'Chat room retrieved', room);
  });

  static startSupportChat = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { Shop } = await import('../models/Shop');
    const shop = await Shop.findOne() as InstanceType<typeof Shop> | null;
    if (!shop) throw new Error('Shop not found');

    const room = await ChatService.getOrCreateCustomerRoom(userId, String(shop._id));
    ResponseHandler.success(res, 'Support chat started', room);
  });

  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;
    const { content, attachments } = req.body;
    const userId = (req as any).user.userId;
    const role = (req as any).user.role === 'customer' ? 'customer' : 'admin';

    const message = await ChatService.sendMessage({
      chatRoomId,
      senderId: userId,
      senderRole: role,
      content,
      attachments
    });

    ResponseHandler.created(res, 'Message sent', message);
  });

  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;
    const { limit, skip } = req.query;
    const messages = await ChatService.getMessages(
      chatRoomId,
      limit ? parseInt(limit as string) : 50,
      skip ? parseInt(skip as string) : 0
    );
    ResponseHandler.success(res, 'Messages retrieved', messages);
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { chatRoomId } = req.params;
    const role = (req as any).user.role === 'customer' ? 'customer' : 'admin';
    await ChatService.markRoomAsRead(chatRoomId, role);
    ResponseHandler.success(res, 'Messages marked as read');
  });

  static getMyRooms = asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user;
    const rooms = role === 'customer'
      ? await ChatService.getCustomerRooms(userId)
      : await ChatService.getAdminRooms(userId);
    ResponseHandler.success(res, 'Chat rooms retrieved', rooms);
  });

  static updateMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;

    const message = await ChatService.updateMessage(messageId, userId, content);
    ResponseHandler.success(res, 'Message updated', message);
  });

  static deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { userId, role } = (req as any).user;
    const requesterRole = role === 'customer' ? 'customer' : 'admin';

    await ChatService.deleteMessage(messageId, userId, requesterRole);
    ResponseHandler.success(res, 'Message deleted');
  });
}
