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

export interface ProductImage {
  fileId: string;
  url: string;
  isThumbnail?: boolean;
}

export interface Product {
  _id: string;
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
  images?: ProductImage[];
  thumbnailImage?: ProductImage;
  shopId?: string;
  sourceType: 'local' | 'external';
  isDraftProduct: boolean;
  gstRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
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
  shopId?: string;
  sourceType?: 'local' | 'external';
  isDraftProduct?: boolean;
  gstRate?: number;
  images?: ProductImage[];
  thumbnailImage?: ProductImage;
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
}

