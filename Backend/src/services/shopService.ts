import { Shop, IShop } from '../models/Shop';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { Product } from '../models/Product';
import { Bill } from '../models/Bill';
import { InventoryHistory } from '../models/InventoryHistory';

export interface DeleteCheckResult {
  canDelete: boolean;
  reason?: string;
  dependencies?: {
    products: number;
    bills: number;
    inventoryHistory: number;
  };
}

export interface PaginatedShopsResult {
  shops: IShop[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ShopService {

  /* ================= CREATE SHOP ================= */
  static async createShop(
    data: Partial<IShop>,
    ownerId: string
  ): Promise<IShop> {
    return await Shop.create({
      ...data,
      owner: ownerId,
    });
  }

  /* ================= GET SINGLE SHOP (BACKWARD) ================= */
  static async getShop(): Promise<IShop> {
    let shop = await Shop.findOne();

    if (!shop) {
      shop = await Shop.create({
        shopName: 'My Tiles Shop',
        ownerName: 'Owner Name',
        mobileNumbers: [''],
      });
    }

    return shop;
  }

  /* ================= GET ALL SHOPS ================= */
  static async getAllShops(
    ownerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedShopsResult> {

    const pageNumber = Math.max(1, Math.floor(page));
    const limitNumber = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const [total, shops] = await Promise.all([
      Shop.countDocuments({ owner: ownerId }),
      Shop.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return {
      shops,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };
  }

  /* ================= GET SHOP BY ID ================= */
  static async getShopById(
    id: string,
    ownerId: string
  ): Promise<IShop | null> {
    return await Shop.findOne({ _id: id, owner: ownerId });
  }

  /* ================= UPDATE SHOP ================= */
  static async updateShopById(
    id: string,
    data: Partial<IShop>,
    ownerId: string
  ): Promise<IShop> {

    const shop = await Shop.findOne({ _id: id, owner: ownerId });
    if (!shop) {
      throw new Error('Shop not found or permission denied');
    }

    Object.assign(shop, data);
    await shop.save();
    return shop;
  }

  /* ================= UPDATE LOGO (CLOUDINARY) ================= */
  static async updateLogoById(
    id: string,
    file: Express.Multer.File,
    ownerId: string
  ): Promise<IShop> {

    const shop = await Shop.findOne({ _id: id, owner: ownerId });
    if (!shop) {
      throw new Error('Shop not found or permission denied');
    }

    const upload = await uploadOnCloudinary(file.path);

    shop.logo = upload.secureUrl;
    await shop.save();
    return shop;
  }

  /* ================= CHECK DELETE DEPENDENCIES ================= */
  static async checkDeleteDependencies(
    shopId: string,
    ownerId: string
  ): Promise<DeleteCheckResult> {

    const shop = await Shop.findOne({ _id: shopId, owner: ownerId });
    if (!shop) {
      throw new Error('Shop not found or permission denied');
    }

    const [products, bills, inventoryHistory] = await Promise.all([
      Product.countDocuments({ shopId }),
      Bill.countDocuments({ shopId }),
      InventoryHistory.countDocuments({ shopId }),
    ]);

    const hasDependencies =
      products > 0 || bills > 0 || inventoryHistory > 0;

    if (hasDependencies) {
      return {
        canDelete: false,
        reason: `Cannot delete shop. Dependencies found.`,
        dependencies: { products, bills, inventoryHistory },
      };
    }

    return {
      canDelete: true,
      dependencies: { products, bills, inventoryHistory },
    };
  }

  /* ================= DELETE SHOP ================= */
  static async deleteShop(
    id: string,
    ownerId: string
  ): Promise<void> {

    const check = await this.checkDeleteDependencies(id, ownerId);
    if (!check.canDelete) {
      throw new Error(check.reason);
    }

    await Shop.findOneAndDelete({ _id: id, owner: ownerId });
  }
}
