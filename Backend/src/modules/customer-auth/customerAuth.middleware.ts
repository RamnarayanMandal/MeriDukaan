import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { UnauthorizedError } from '../../middlewares/errorHandler';

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET!;

export const customerAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];
    const payload: any = jwt.verify(token, CUSTOMER_JWT_SECRET);

    if (payload.role !== 'customer') {
      throw new UnauthorizedError('Invalid token type.');
    }

    const customer = await User.findById(payload.customerId).select('-password -refreshToken');
    if (!customer || customer.status !== 'active') {
      throw new UnauthorizedError('Customer account not found or deactivated.');
    }

    (req as any).customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};
