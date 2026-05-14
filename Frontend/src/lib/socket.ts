import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (): Socket => {
  const token = getToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Remove /api from URL if present for socket connection
  const socketUrl = apiUrl.replace(/\/api$/, '');

  if (!socket || token !== currentToken) {
    if (socket) {
      socket.disconnect();
    }

    currentToken = token;
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    socket.on('connect_error', (error: any) => {
      console.error('⚠️ Socket connection error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
