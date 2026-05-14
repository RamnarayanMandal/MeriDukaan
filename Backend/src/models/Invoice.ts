import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  itemType: 'product' | 'service' | 'manual';
  productId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  name: string; // Used for manual items or caching names
  quantity: number;
  rate: number;
  amount: number;
}

export interface IPaymentHistory {
  amount: number;
  method: 'cash' | 'upi' | 'card';
  date: Date;
  note?: string;
}

export interface IInvoice extends Document {
  shopId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  customerId?: mongoose.Types.ObjectId; // Link to CRM
  customerName: string;
  customerPhone: string;
  vehicleModel?: string;
  appointmentId?: mongoose.Types.ObjectId;
  
  items: IInvoiceItem[];
  
  subtotal: number;
  discount: number;
  gstRate: number; // e.g., 18 for 18%
  gstAmount: number;
  grandTotal: number;
  amountPaid: number;
  
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod?: 'cash' | 'upi' | 'card';
  paymentHistory?: IPaymentHistory[];
  
  qrCodeUrl?: string;
  pdfUrl?: string;
}

const invoiceItemSchema = new Schema({
  itemType: { type: String, enum: ['product', 'service', 'manual'], required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new Schema({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  vehicleModel: { type: String },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  
  items: [invoiceItemSchema],
  
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  
  notes: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'] },
  paymentHistory: [
    {
      amount: { type: Number, required: true },
      method: { type: String, enum: ['cash', 'upi', 'card'], required: true },
      date: { type: Date, default: Date.now },
      note: { type: String }
    }
  ],
  
  qrCodeUrl: { type: String },
  pdfUrl: { type: String }
}, { timestamps: true });

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customerPhone: 1 });
invoiceSchema.index({ shopId: 1, createdAt: -1 });

// Generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function (shopId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const latestInvoice = await this.findOne({
    shopId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (latestInvoice) {
    const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2] || '0');
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;
