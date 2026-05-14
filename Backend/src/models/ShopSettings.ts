import mongoose, { Document, Schema } from 'mongoose';

export interface IShopSettings extends Document {
  shopId: mongoose.Types.ObjectId;
  shopName: string;
  logo?: string;
  banner?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  country: string;
  latitude?: string;
  longitude?: string;
  googleMapLink?: string;
  openingHours: string;
  closingHours: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  favicon?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  gstNumber?: string;
  invoiceFooter?: string;
  themeColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

const shopSettingsSchema = new Schema<IShopSettings>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, unique: true },
  shopName: { type: String, required: true },
  logo: { type: String },
  banner: { type: String },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  country: { type: String, required: true, default: 'India' },
  latitude: { type: String },
  longitude: { type: String },
  googleMapLink: { type: String },
  openingHours: { type: String, required: true, default: '09:00 AM' },
  closingHours: { type: String, required: true, default: '08:00 PM' },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
  favicon: { type: String },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String }
  },
  gstNumber: { type: String },
  invoiceFooter: { type: String, default: 'Thank you for your business!' },
  themeColors: {
    primary: { type: String, default: '#2563eb' }, // Default Blue
    secondary: { type: String, default: '#1e40af' },
    accent: { type: String, default: '#f59e0b' }
  }
}, { timestamps: true });

export const ShopSettings = mongoose.model<IShopSettings>('ShopSettings', shopSettingsSchema);
