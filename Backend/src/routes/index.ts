import express from 'express';
import authRoutes from './api/authRoutes';
import firebaseAuthRoutes from './api/firebaseAuthRoutes';
import shopRoutes from './api/shopRoutes';
import productRoutes from './api/productRoutes';
import billRoutes from './api/billRoutes';
import aboutRoutes from './api/aboutRoutes';
import serviceRoutes from '../modules/services/service.routes';
import appointmentRoutes from '../modules/appointments/appointment.routes';
import invoiceRoutes from '../modules/invoices/invoice.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import chatRoutes from './api/chatRoutes';
import notificationRoutes from './api/notificationRoutes';
import customerAuthRoutes from '../modules/customer-auth/customerAuth.routes';

const router = express.Router();

// Public routes (No Auth)
import publicRoutes from './api/publicRoutes';
router.use('/public', publicRoutes);

// Service Management routes
router.use('/services', serviceRoutes);

// Appointment routes
router.use('/appointments', appointmentRoutes);

// Smart Invoicing routes
router.use('/invoices', invoiceRoutes);

// Chat routes
router.use('/chat', chatRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Dashboard Analytics routes
router.use('/analytics', analyticsRoutes);

// Shop Settings routes
import shopSettingsRoutes from './api/shopSettingsRoutes';
router.use('/shop-settings', shopSettingsRoutes);

// Authentication routes
router.use('/auth', authRoutes);
router.use('/customer-auth', customerAuthRoutes);

// Firebase Authentication routes (separate from main auth to avoid middleware conflicts)
router.use('/firebase', firebaseAuthRoutes);

// Shop Management routes (admin only)
router.use('/shop', shopRoutes);

// Product/Inventory routes (admin only)
router.use('/products', productRoutes);

// Bill routes (admin only)
router.use('/bills', billRoutes);

// About routes (GET public, PUT admin only)
router.use('/about', aboutRoutes);

// Image Upload route
import uploadRoutes from './api/uploadRoutes';
router.use('/upload', uploadRoutes);

export default router;