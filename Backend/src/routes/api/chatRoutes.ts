import { Router } from 'express';
import { ChatController } from '../../controllers/chat.controller';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/rooms', ChatController.getMyRooms);
router.get('/rooms/:appointmentId', ChatController.getOrCreateRoom);
router.post('/rooms/customer/:customerId', ChatController.getOrCreateCustomerRoom);
router.post('/rooms/support', ChatController.startSupportChat);
router.get('/messages/:chatRoomId', ChatController.getMessages);
router.post('/messages/:chatRoomId', ChatController.sendMessage);
router.patch('/messages/:chatRoomId/read', ChatController.markAsRead);
router.patch('/message/:messageId', ChatController.updateMessage);
router.delete('/message/:messageId', ChatController.deleteMessage);

export default router;
