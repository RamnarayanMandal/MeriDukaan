import { Request, Response } from 'express';
import { AboutService } from '../services/aboutService';
import { updateAboutSchema } from '../validations/aboutValidation';
import { ResponseHandler } from '../utils/responseHandler';

export class AboutController {
  /**
   * Get about content
   */
  static async getAbout(req: Request, res: Response) {
    try {
      const about = await AboutService.getAbout();
      return ResponseHandler.success(res, 'About content retrieved successfully', about);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /**
   * Update about content (admin only)
   */
  static async updateAbout(req: Request, res: Response) {
    try {
      const validatedData = updateAboutSchema.parse(req.body);
      const about = await AboutService.updateAbout(validatedData);
      return ResponseHandler.success(res, 'About content updated successfully', about);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }
}

