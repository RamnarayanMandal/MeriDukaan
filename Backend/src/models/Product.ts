import mongoose from 'mongoose';

export enum ProductCategory {
  TILES = 'Tiles',
  MARBLE = 'Marble',
  GRANITE = 'Granite',
  ACCESSORIES = 'Accessories',
}

export enum ProductUnit {
  SQ_FT = 'Sq ft',
  SQ_M = 'Sq m',
  BOX = 'Box',
  PIECE = 'Piece',
  KG = 'Kg',
  GRAM = 'Gram',
  LITRE = 'Litre',
  ML = 'Ml',
  PACK = 'Pack',
}

export interface IProductImage {
  fileId: string;
  url: string;
  isThumbnail?: boolean;
}

export interface IProduct extends mongoose.Document {
  name: string;
  category: string;
  productCode?: string;
  sku?: string;
  barcode: string;
  brand?: string;
  price: number;
  stockQty: number;
  unit: ProductUnit;
  description?: string;
  images?: IProductImage[];
  thumbnailImage?: IProductImage;
  shopId: mongoose.Types.ObjectId;
  sourceType: 'local' | 'external';
  isDraftProduct: boolean;
  gstRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    productCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stockQty: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: Object.values(ProductUnit),
      required: [true, 'Unit is required'],
      default: ProductUnit.PIECE,
    },
    description: {
      type: String,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['local', 'external'],
      default: 'local',
    },
    isDraftProduct: {
      type: Boolean,
      default: false,
    },
    gstRate: {
      type: Number,
      default: 0,
    },
    images: [
      {
        fileId: { type: String, required: true },
        url: { type: String, required: true },
        isThumbnail: { type: Boolean, default: false },
      },
    ],
    thumbnailImage: {
      fileId: { type: String },
      url: { type: String },
      isThumbnail: { type: Boolean, default: true },
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ productCode: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ shopId: 1, name: 1 });
productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ shopId: 1, barcode: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

