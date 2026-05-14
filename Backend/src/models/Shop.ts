import mongoose from 'mongoose';

export interface IShop extends mongoose.Document {
  shopName: string;
  logo?: string | null;
  /**
   * Google Drive file id for logo (new multi-shop/logo support)
   */
  logoDriveFileId?: string | null;
  /**
   * Public URL for logo image (kept in sync with `logo` for backward compatibility)
   */
  logoUrl?: string | null;
  address?: string;
  ownerName: string;
  mobileNumbers: string[];
  gstNo?: string;
  email?: string;
  owner: mongoose.Types.ObjectId;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new mongoose.Schema<IShop>(
  {
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    logoDriveFileId: {
      type: String,
      default: null,
    },
    logoUrl: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    mobileNumbers: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one mobile number is required',
      },
    },
    gstNo: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop owner is required'],
      index: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model<IShop>('Shop', shopSchema);

