import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { asyncHandler } from './errorHandler';

export const validateRequest = (schema: ZodSchema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
};
