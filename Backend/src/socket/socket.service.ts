import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';

export class SocketService {
  private static io: Server;
  private static userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  public static initialize(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: Token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        const user = await User.findById(decoded.userId).select('role email');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        (socket as any).user = {
          userId: user._id.toString(),
          role: user.role,
          email: user.email
        };

        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      console.log(`🔌 Socket connected: ${user.userId} (${user.role})`);

      // Register user socket
      const userSockets = this.userSockets.get(user.userId) || [];
      userSockets.push(socket.id);
      this.userSockets.set(user.userId, userSockets);

      // Join personal room for private notifications
      socket.join(`user:${user.userId}`);
      
      // Admin joins admin room
      if (user.role === 'admin' || user.role === 'staff') {
        socket.join('admin-room');
      }

      socket.on('join-chat', (chatRoomId: string) => {
        socket.join(`chat:${chatRoomId}`);
        console.log(`💬 User ${user.userId} joined chat room: ${chatRoomId}`);
      });

      socket.on('leave-chat', (chatRoomId: string) => {
        socket.leave(`chat:${chatRoomId}`);
        console.log(`💬 User ${user.userId} left chat room: ${chatRoomId}`);
      });

      socket.on('disconnect', () => {
        const sockets = this.userSockets.get(user.userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          this.userSockets.delete(user.userId);
        }
        console.log(`🔌 Socket disconnected: ${user.userId}`);
      });
    });
  }

  // Send to specific user
  public static sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send to all admins
  public static sendToAdmins(event: string, data: any) {
    this.io.to('admin-room').emit(event, data);
  }

  // Send to chat room
  public static sendToChat(chatRoomId: string, event: string, data: any) {
    this.io.to(`chat:${chatRoomId}`).emit(event, data);
  }

  // Broadcast to all
  public static broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
