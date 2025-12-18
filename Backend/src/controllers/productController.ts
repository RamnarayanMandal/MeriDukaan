import { Request, Response } from 'express';
import { InventoryService } from '../services/inventoryService';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
} from '../validations/productValidation';
import { ResponseHandler } from '../utils/responseHandler';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { IProductImage } from '../models/Product';

export class ProductController {

  /* ================= CREATE PRODUCT ================= */
  static async createProduct(req: Request, res: Response) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await InventoryService.createProduct(validatedData);
      return ResponseHandler.success(res, 'Product created successfully', product, 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= GET PRODUCTS ================= */
  static async getProducts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const filters = getProductsQuerySchema.parse(req.query);

      const products = await InventoryService.getProducts(filters, userId);
      return ResponseHandler.success(res, 'Products retrieved successfully', products);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= GET PRODUCT BY ID ================= */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await InventoryService.getProductById(id);

      if (!product) {
        return ResponseHandler.error(res, 'Product not found', 404);
      }

      return ResponseHandler.success(res, 'Product retrieved successfully', product);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= UPDATE PRODUCT ================= */
  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      const product = await InventoryService.updateProduct(id, validatedData);
      if (!product) {
        return ResponseHandler.error(res, 'Product not found', 404);
      }

      return ResponseHandler.success(res, 'Product updated successfully', product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseHandler.error(res, error.errors[0].message, 400);
      }
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= DELETE PRODUCT ================= */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await InventoryService.deleteProduct(id);

      if (!deleted) {
        return ResponseHandler.error(res, 'Product not found', 404);
      }

      return ResponseHandler.success(res, 'Product deleted successfully', null);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= UPLOAD PRODUCT IMAGES (CLOUDINARY) ================= */
  static async uploadImages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || !files.length) {
        return ResponseHandler.error(res, 'No images provided', 400);
      }

      // Check product exists
      const existingProduct = await InventoryService.getProductById(id);
      if (!existingProduct) {
        return ResponseHandler.error(res, 'Product not found', 404);
      }

      const uploads: IProductImage[] = [];

      for (const file of files) {
        try {
          const uploaded = await uploadOnCloudinary(file.path);

          uploads.push({
            fileId: uploaded.publicId,   // Cloudinary public_id
            url: uploaded.secureUrl,     // Cloudinary secure URL
          });
        } catch (uploadError: any) {
          console.error('Cloudinary upload error:', uploadError);
          return ResponseHandler.error(
            res,
            `Failed to upload image "${file.originalname}"`,
            500
          );
        }
      }

      const product = await InventoryService.appendProductImages(id, uploads);

      if (!product) {
        return ResponseHandler.error(res, 'Failed to update product images', 500);
      }

      return ResponseHandler.success(res, 'Images uploaded successfully', product);
    } catch (error: any) {
      console.error('uploadImages error:', error);
      return ResponseHandler.error(res, error.message, 500);
    }
  }

  /* ================= SET PRODUCT THUMBNAIL ================= */
  static async setThumbnail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { imageFileId } = req.body as { imageFileId?: string };

      if (!imageFileId) {
        return ResponseHandler.error(res, 'imageFileId is required', 400);
      }

      const product = await InventoryService.setProductThumbnail(id, imageFileId);

      if (!product) {
        return ResponseHandler.error(res, 'Product not found', 404);
      }

      return ResponseHandler.success(res, 'Thumbnail updated successfully', product);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message, 500);
    }
  }
}
