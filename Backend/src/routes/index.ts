import express from 'express';
import authRoutes from './api/authRoutes';
import firebaseAuthRoutes from './api/firebaseAuthRoutes';
import shopRoutes from './api/shopRoutes';
import productRoutes from './api/productRoutes';
import billRoutes from './api/billRoutes';
import aboutRoutes from './api/aboutRoutes';

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

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

export default router;