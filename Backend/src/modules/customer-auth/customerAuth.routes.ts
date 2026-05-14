import { Router } from 'express';
import {
  customerSignup,
  customerLogin,
  customerRefreshToken,
  customerLogout,
  getCustomerProfile,
  updateCustomerProfile,
  customerChangePassword,
} from './customerAuth.controller';
import { customerAuth } from './customerAuth.middleware';

const router = Router();

// Public routes
router.post('/signup', customerSignup);
router.post('/login', customerLogin);
router.post('/refresh', customerRefreshToken);

// Protected routes (requires customer JWT)
router.post('/logout', customerAuth, customerLogout);
router.get('/me', customerAuth, getCustomerProfile);
router.patch('/me', customerAuth, updateCustomerProfile);
router.put('/change-password', customerAuth, customerChangePassword);

export default router;
