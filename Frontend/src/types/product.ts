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
}

export interface ProductImage {
  fileId: string;
  url: string;
  isThumbnail?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  category: string; // Changed from ProductCategory enum to string to allow custom categories
  productCode?: string;
  price: number;
  stockQty: number;
  unit: ProductUnit;
  description?: string;
  images?: ProductImage[];
  thumbnailImage?: ProductImage;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  category: string; // Changed from ProductCategory enum to string to allow custom categories
  productCode?: string;
  price: number;
  stockQty?: number;
  unit: ProductUnit;
  description?: string;
  shopId?: string;
}

export interface UpdateProductData {
  name?: string;
  category?: string; // Changed from ProductCategory enum to string to allow custom categories
  productCode?: string;
  price?: number;
  stockQty?: number;
  unit?: ProductUnit;
  description?: string;
}

