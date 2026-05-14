import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { CustomerAuthService } from './customerAuth.service';
import { ResponseHandler } from '../../utils/responseHandler';

const service = new CustomerAuthService();

export const customerSignup = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.signup(req.body);
  res.cookie('customerRefreshToken', result.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  ResponseHandler.created(res, result.message, result.data);
});

export const customerLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.login(req.body);
  res.cookie('customerRefreshToken', result.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie('token', result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  ResponseHandler.success(res, result.message, result.data);
});

export const customerRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.customerRefreshToken || req.body?.refreshToken;
  const result = await service.refresh(refreshToken);
  res.cookie('customerRefreshToken', result.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.cookie('token', result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  ResponseHandler.success(res, 'Token refreshed successfully', result.data);
});

export const customerLogout = asyncHandler(async (req: Request, res: Response) => {
  const customerId = (req as any).customer?._id;
  if (customerId) await service.logout(customerId.toString());
  res.clearCookie('customerRefreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export const getCustomerProfile = asyncHandler(async (req: Request, res: Response) => {
  const customerId = (req as any).customer?._id;
  const result = await service.getProfile(customerId.toString());
  ResponseHandler.success(res, 'Profile fetched successfully', result.data);
});

export const updateCustomerProfile = asyncHandler(async (req: Request, res: Response) => {
  const customerId = (req as any).customer?._id;
  const result = await service.updateProfile(customerId.toString(), req.body);
  ResponseHandler.success(res, 'Profile updated successfully', result.data);
});

export const customerChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const customerId = (req as any).customer?._id;
  const result = await service.changePassword(customerId.toString(), req.body);
  res.json({ success: true, message: result.message });
});
