import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  estimatedDuration: number; // in minutes
  isActive: boolean;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['General', 'Engine', 'Washing', 'Brakes', 'Electrical', 'Tires', 'Body', 'Other'] 
  },
  description: { type: String },
  basePrice: { type: Number, required: true, min: 0 },
  estimatedDuration: { type: Number, required: true, default: 60 },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String }
}, { timestamps: true });

// Indexing for search
ServiceSchema.index({ name: 'text', category: 'text' });

const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
export default Service;
