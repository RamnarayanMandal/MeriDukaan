import mongoose from 'mongoose';
import { IProduct } from './Product';

export interface IBillItem {
  product: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IBill extends mongoose.Document {
  shopId: mongoose.Types.ObjectId;
  billNumber: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  billDate: Date;
  items: IBillItem[];
  subtotal: number;
  tax?: number;
  grandTotal: number;
  amountInWords: string;
  createdAt: Date;
  updatedAt: Date;
}

const billItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity must be greater than 0'],
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Rate cannot be negative'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema<IBill>(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerAddress: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    billDate: {
      type: Date,
      required: [true, 'Bill date is required'],
      default: Date.now,
    },
    items: {
      type: [billItemSchema],
      required: true,
      validate: {
        validator: function (v: IBillItem[]) {
          return v.length > 0;
        },
        message: 'At least one item is required',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, 'Grand total cannot be negative'],
    },
    amountInWords: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
billSchema.index({ billNumber: 1 });
billSchema.index({ billDate: -1 });
billSchema.index({ customerName: 1 });
billSchema.index({ shopId: 1, billDate: -1 });

// Generate unique bill number
billSchema.statics.generateBillNumber = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BILL-${year}-`;
  
  // Find the latest bill for this year
  const latestBill = await this.findOne({
    billNumber: { $regex: `^${prefix}` },
  }).sort({ billNumber: -1 });
  
  let sequence = 1;
  if (latestBill) {
    const lastSequence = parseInt(latestBill.billNumber.split('-')[2] || '0');
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

export const Bill = mongoose.model<IBill>('Bill', billSchema);

