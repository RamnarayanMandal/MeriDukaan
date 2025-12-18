import { Product } from './product';

export interface BillItem {
  product: Product | string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Bill {
  _id: string;
  billNumber: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate: string;
  items: BillItem[];
  subtotal: number;
  tax?: number;
  grandTotal: number;
  amountInWords: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillItem {
  productId: string;
  quantity: number;
  rate: number;
}

export interface CreateBillData {
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate?: Date | string;
  items: CreateBillItem[];
  tax?: number;
}

export interface UpdateBillData {
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate?: Date | string;
  items?: CreateBillItem[];
  tax?: number;
}

