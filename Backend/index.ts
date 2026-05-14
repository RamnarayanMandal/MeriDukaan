import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { SocketService } from './src/socket/socket.service';
import { config } from './src/config/env';
import router from './src/routes/index';
import { initializeSystemRoles } from './src/utils/initializeRoles';
import { globalErrorHandler, notFoundHandler } from './src/middlewares/errorHandler';
import { redisClient } from './src/shared/redis/redis.client';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Routes
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shop Management System API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Shop Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health',
    },
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(config.database.uri);
    console.log('✅ MongoDB connected successfully');

    // Connect Redis

    try {
      await redisClient.connect();
    } catch (err) {
      console.warn('⚠️ Redis failed to connect. Running without cache.', err.message);
    }

    // Initialize system roles
    await initializeSystemRoles();

    const server = http.createServer(app);
    
    // Initialize Socket.io
    SocketService.initialize(server);

    server.listen(config.server.port, () => {
      console.log(`🚀 Server started on port ${config.server.port}`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}`);
      console.log(`📧 Email service: ${config.email.host}:${config.email.port}`);
      console.log(`🔐 JWT expires in: ${config.jwt.expiresIn}`);
      console.log(`👥 Shop Management System ready with Socket.io`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
