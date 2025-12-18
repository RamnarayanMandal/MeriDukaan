import mongoose from 'mongoose';

export type InventoryActionType =
  | 'ADD'
  | 'SALE'
  | 'UPDATE'
  | 'DELETE'
  | 'BILL_EDIT';

export interface IInventoryHistory extends mongoose.Document {
  productId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  actionType: InventoryActionType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const inventoryHistorySchema = new mongoose.Schema<IInventoryHistory>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['ADD', 'SALE', 'UPDATE', 'DELETE', 'BILL_EDIT'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// make records effectively immutable – prevent updates after creation
inventoryHistorySchema.pre('findOneAndUpdate', function (next) {
  next(new Error('Inventory history records are immutable and cannot be updated'));
});

inventoryHistorySchema.pre('updateMany', function (next) {
  next(new Error('Inventory history records are immutable and cannot be updated'));
});

export const InventoryHistory = mongoose.model<IInventoryHistory>(
  'InventoryHistory',
  inventoryHistorySchema
);


