import {
  Product,
  IProduct,
  ProductCategory,
  ProductUnit,
  IProductImage,
} from '../models/Product';
import { InventoryHistory } from '../models/InventoryHistory';
import { Shop } from '../models/Shop';
import mongoose from 'mongoose';
import { BarcodeApiService } from './BarcodeApiService';

export interface CreateProductData {
  shopId: string;
  name: string;
  category: string;
  productCode?: string;
  sku?: string;
  barcode: string;
  brand?: string;
  price: number;
  stockQty?: number;
  unit: ProductUnit;
  description?: string;
  sourceType?: 'local' | 'external';
  isDraftProduct?: boolean;
  gstRate?: number;
  images?: IProductImage[];
  thumbnailImage?: IProductImage;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  productCode?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  price?: number;
  stockQty?: number;
  unit?: ProductUnit;
  description?: string;
  gstRate?: number;
  images?: IProductImage[];
  thumbnailImage?: IProductImage;
}

export class InventoryService {
  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductData): Promise<IProduct> {
    const product = await Product.create({
      ...data,
      shopId: new mongoose.Types.ObjectId(data.shopId),
      stockQty: data.stockQty || 0,
      sourceType: data.sourceType || 'local',
      isDraftProduct: data.isDraftProduct || false,
      images: data.images || [],
      thumbnailImage: data.thumbnailImage,
    });

    // create inventory history entry if initial stock is provided and > 0
    if (data.stockQty && data.stockQty > 0) {
      await InventoryHistory.create({
        productId: product._id,
        shopId: product.shopId,
        actionType: 'ADD',
        quantityChange: data.stockQty,
        previousStock: 0,
        newStock: data.stockQty,
      });
    }

    // Invalidate Cache
    const { CacheService } = await import('../shared/cache/cache.service');
    await CacheService.invalidatePattern('products:*');

    return product;
  }

  /**
   * Get all products with optional filters
   */
  static async getProducts(
    filters?: {
      shopId?: string;
      category?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
    userId?: string
  ): Promise<{
    items: IProduct[];
    page: number;
    limit: number;
    totalCount: number;
  }> {
    const query: any = {};

    // If userId is provided, filter by user's shops
    if (userId) {
      if (filters?.shopId) {
        // Verify the shop belongs to the user
        const shop = await Shop.findOne({ _id: filters.shopId, owner: userId });
        if (!shop) {
          // Return empty result if shop doesn't belong to user
          return { items: [], page: filters?.page || 1, limit: filters?.limit || 10, totalCount: 0 };
        }
        query.shopId = new mongoose.Types.ObjectId(filters.shopId);
      } else {
        // Get all shop IDs owned by the user
        const userShops = await Shop.find({ owner: userId }).select('_id');
        const shopIds = userShops.map((shop) => shop._id);
        if (shopIds.length === 0) {
          // User has no shops, return empty result
          return { items: [], page: filters?.page || 1, limit: filters?.limit || 10, totalCount: 0 };
        }
        query.shopId = { $in: shopIds };
      }
    } else if (filters?.shopId) {
      query.shopId = new mongoose.Types.ObjectId(filters.shopId);
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { productCode: { $regex: filters.search, $options: 'i' } },
        { barcode: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Date filter - filter by createdAt
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;

    // Cache Implementation
    const cacheKey = `products:${filters?.shopId || 'all'}:${filters?.category || 'all'}:${filters?.search || ''}:${page}:${limit}`;
    const { CacheService } = await import('../shared/cache/cache.service');
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return cachedData as any;

    const { PaginationUtil } = await import('../shared/pagination/pagination.util');
    const paginatedResult = await PaginationUtil.paginate(Product, query, {
      page,
      limit,
      sort: { createdAt: -1 }
    });

    const result = {
      items: paginatedResult.data,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
      totalCount: paginatedResult.meta.total,
      meta: paginatedResult.meta
    };

    // Cache for 1 hour
    await CacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  /**
   * Get product by Barcode with External API Fallback
   */
  static async getProductByBarcode(barcode: string, shopId: string): Promise<IProduct | null> {
    const query: any = { barcode, shopId: new mongoose.Types.ObjectId(shopId) };

    // 1. Check local database first
    const product = await Product.findOne(query);
    if (product) {
      return product;
    }

    // 2. If not found, try external API
    const externalData = await BarcodeApiService.fetchFromExternal(barcode);
    if (externalData) {
      // Create a draft product for this shop
      const draftProduct = await Product.create({
        name: externalData.name,
        brand: externalData.brand,
        category: externalData.category || 'External',
        barcode: barcode,
        price: 0,
        stockQty: 0,
        unit: ProductUnit.PIECE,
        shopId: new mongoose.Types.ObjectId(shopId),
        sourceType: 'external',
        isDraftProduct: true,
        description: `Imported from external barcode database.`,
      });

      return draftProduct;
    }

    return null;
  }

  /**
   * Update product
   */
  static async updateProduct(
    id: string,
    data: UpdateProductData
  ): Promise<IProduct | null> {
    const product = await Product.findById(id);
    if (!product) {
      return null;
    }

    const prevStock = product.stockQty;

    if (typeof data.stockQty === 'number') {
      const newStock = data.stockQty;
      const quantityChange = newStock - prevStock;

      if (quantityChange !== 0) {
        await InventoryHistory.create({
          productId: product._id,
          shopId: product.shopId,
          actionType: 'UPDATE',
          quantityChange,
          previousStock: prevStock,
          newStock,
        });

        product.stockQty = newStock;
      }
    }

    if (typeof data.name !== 'undefined') product.name = data.name;
    if (typeof data.category !== 'undefined') product.category = data.category;
    if (typeof data.productCode !== 'undefined')
      product.productCode = data.productCode;
    if (typeof data.price !== 'undefined') product.price = data.price;
    if (typeof data.unit !== 'undefined') product.unit = data.unit;
    if (typeof data.description !== 'undefined')
      product.description = data.description;

    await product.save();

    // Invalidate Cache
    const { CacheService } = await import('../shared/cache/cache.service');
    await CacheService.invalidatePattern('products:*');

    return product;
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const product = await Product.findById(id);
    if (!product) {
      return false;
    }

    if (product.stockQty > 0) {
      await InventoryHistory.create({
        productId: product._id,
        shopId: product.shopId,
        actionType: 'DELETE',
        quantityChange: -product.stockQty,
        previousStock: product.stockQty,
        newStock: 0,
      });
    }

    await product.deleteOne();

    // Invalidate Cache
    const { CacheService } = await import('../shared/cache/cache.service');
    await CacheService.invalidatePattern('products:*');

    return true;
  }

  /**
   * Update stock quantity (used when bills are created/updated/deleted)
   */
  static async updateStock(
    productId: string,
    quantityChange: number,
    actionType: 'ADD' | 'SALE' | 'UPDATE' | 'DELETE' | 'BILL_EDIT',
    referenceId?: string
  ): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const previousStock = product.stockQty;
    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    product.stockQty = newStock;
    await product.save();

    await InventoryHistory.create({
      productId: product._id,
      shopId: product.shopId,
      actionType,
      quantityChange,
      previousStock,
      newStock,
      referenceId: referenceId ? new mongoose.Types.ObjectId(referenceId) : null,
    });

    // Invalidate Cache
    const { CacheService } = await import('../shared/cache/cache.service');
    await CacheService.invalidatePattern('products:*');

    return product;
  }

  /**
   * Get products by IDs (for bill items)
   */
  static async getProductsByIds(ids: string[]): Promise<IProduct[]> {
    return await Product.find({ _id: { $in: ids } });
  }

  /**
   * Append images to product
   */
  static async appendProductImages(
    productId: string,
    images: IProductImage[]
  ): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    const existingImages = product.images || [];
    product.images = [...existingImages, ...images];

    // if no thumbnail set yet, use first image as thumbnail
    if (!product.thumbnailImage && product.images.length > 0) {
      const thumb = product.images[0];
      thumb.isThumbnail = true;
      product.thumbnailImage = { ...thumb };
    }

    await product.save();
    return product;
  }

  /**
   * Set thumbnail image by image fileId
   */
  static async setProductThumbnail(
    productId: string,
    imageFileId: string
  ): Promise<IProduct | null> {
    const product = await Product.findById(productId);
    if (!product || !product.images) {
      return null;
    }

    product.images = product.images.map((img) => ({
      ...img,
      isThumbnail: img.fileId === imageFileId,
    }));

    const thumbnail = product.images.find((img) => img.fileId === imageFileId);

    if (thumbnail) {
      product.thumbnailImage = { ...thumbnail };
    }

    await product.save();
    return product;
  }
}

