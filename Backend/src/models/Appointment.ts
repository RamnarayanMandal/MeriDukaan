import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  customerId?: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  customerName: string;
  phoneNumber: string;
  bikeModel: string;
  serviceId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  timeSlot: string;
  issueDescription?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected' | 'bike-ready';
  assignedMechanic?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

const AppointmentSchema: Schema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  bikeModel: { type: String, required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  issueDescription: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected', 'bike-ready'],
    default: 'pending' 
  },
  assignedMechanic: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

// Indexing for performance
AppointmentSchema.index({ phoneNumber: 1, status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 }); // Compound index for filtering

const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;
