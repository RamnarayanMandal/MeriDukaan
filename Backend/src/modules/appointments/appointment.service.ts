import Appointment, { IAppointment } from '../../models/Appointment';
import { User } from '../../models/User';
import { AppError } from '../../middlewares/errorHandler';
import { NotificationService } from '../../services/notification.service';
import { ChatService } from '../../services/chat.service';
import { Shop } from '../../models/Shop';

export class AppointmentModuleService {
  /**
   * Create a new appointment (Public facing)
   */
  async createAppointment(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    // If shopId is missing, try to get the first available shop
    if (!appointmentData.shopId) {
      const shop = await Shop.findOne();
      if (shop) {
        appointmentData.shopId = shop._id as any;
      }
    }

    // 1. Create the appointment
    const appointment = await Appointment.create(appointmentData);

    // 2. Handle User (Customer) CRM Logic
    let user = await User.findOne({ phoneNumber: appointmentData.phoneNumber });

    if (user) {
      // Update existing user
      const bikeModel = appointmentData.bikeModel as string;
      if (bikeModel && !user.bikeModel.includes(bikeModel)) {
        user.bikeModel.push(bikeModel);
      }
      user.totalVisits += 1;
      user.lastServiceDate = new Date();
      await user.save();

      // Link appointment to user if not already linked (e.g. if booked with phone but user logged in later)
      if (!appointment.customerId) {
        appointment.customerId = user._id as any;
        await appointment.save();
      }
    }

    // 3. Create Notification for Admin
    await NotificationService.createNotification({
      recipientId: appointmentData.shopId?.toString() || 'admin_default', // Placeholder for shop owner
      recipientRole: 'admin',
      type: 'booking_new',
      title: 'New Appointment Booked',
      message: `${appointmentData.customerName} booked ${appointmentData.bikeModel} for ${appointmentData.timeSlot} on ${new Date(appointmentData.appointmentDate!).toLocaleDateString()}`,
      relatedAppointmentId: appointment._id.toString()
    });

    // 4. Create Chat Room
    await ChatService.getOrCreateRoom(appointment._id.toString());

    // 5. Trigger WhatsApp Notification
    await this.sendWhatsAppNotification(appointment);

    // Invalidate caches
    const { CacheService } = await import('../../shared/cache/cache.service');
    await CacheService.invalidatePattern('appointments:*');
    await CacheService.invalidatePattern('dashboard:*');

    return appointment;
  }

  /**
   * Helper to send WhatsApp Notifications via external API (e.g., Twilio/Interakt)
   */
  private async sendWhatsAppNotification(appointment: IAppointment) {
    try {
      // In a real production app, this would use Axios to call the WhatsApp API provider
      // Example payload:
      const messagePayload = {
        to: `+91${appointment.phoneNumber}`,
        templateName: 'booking_confirmation',
        language: 'en',
        parameters: [
          appointment.customerName,
          new Date(appointment.appointmentDate).toLocaleDateString(),
          appointment.timeSlot,
          appointment.bikeModel
        ]
      };

      console.log(`[WhatsApp Service] Mocking send to ${messagePayload.to}:`, messagePayload);
      // await axios.post('https://api.interakt.ai/v1/public/message/', messagePayload, { headers });
    } catch (error) {
      console.error('[WhatsApp Service] Failed to send notification:', error);
      // We don't throw the error so the booking process isn't interrupted
    }
  }

  /**
   * Get all appointments (Admin/Customer)
   */
  async getAllAppointments(query: any): Promise<{
    appointments: IAppointment[];
    total: number;
    page: number;
    limit: number;
    meta: any;
  }> {
    const { page = 1, limit = 10, status, date } = query;

    // Check Cache
    const cacheKey = `appointments:${status || 'all'}:${date || 'all'}:${query.customerId || 'all'}:${page}:${limit}`;
    const { CacheService } = await import('../../shared/cache/cache.service');
    const cachedData = await CacheService.get<any>(cacheKey);
    if (cachedData) return cachedData;

    const filter: any = {};
    if (status) filter.status = status;
    if (query.customerId) filter.customerId = query.customerId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { customerName: searchRegex },
        { phoneNumber: searchRegex },
        { bikeModel: searchRegex }
      ];
    }

    const { PaginationUtil } = await import('../../shared/pagination/pagination.util');
    const paginatedResult = await PaginationUtil.paginate(Appointment, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { appointmentDate: 1, timeSlot: 1 },
      populate: { path: 'serviceId', select: 'name basePrice estimatedDuration' }
    });

    const result = {
      appointments: paginatedResult.data,
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
      meta: paginatedResult.meta
    };

    // Cache for 10 minutes
    await CacheService.set(cacheKey, result, 600);

    return result;
  }

  /**
   * Update appointment status (Admin)
   */
  async updateStatus(id: string, status: string, assignedMechanic?: string): Promise<IAppointment> {
    const updateData: any = { status };
    if (assignedMechanic) updateData.assignedMechanic = assignedMechanic;

    const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('serviceId', 'name basePrice estimatedDuration');

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // If status changes to confirmed or bike-ready, notify customer
    if (status === 'confirmed' || status === 'bike-ready') {
      await NotificationService.createNotification({
        recipientId: appointment.customerId?.toString() || '',
        recipientRole: 'customer',
        type: status === 'confirmed' ? 'booking_confirmed' : 'bike_ready',
        title: status === 'confirmed' ? 'Booking Confirmed' : 'Bike Ready for Pickup',
        message: status === 'confirmed'
          ? `Your booking for ${appointment.bikeModel} has been confirmed.`
          : `Great news! Your ${appointment.bikeModel} is ready for pickup.`,
        relatedAppointmentId: appointment._id.toString()
      });
    }

    // If completed, update user's last service date
    if (status === 'completed' && appointment.customerId) {
      await User.findByIdAndUpdate(appointment.customerId, {
        lastServiceDate: new Date()
      });
      // TODO: Automatically create draft invoice
    }

    // Invalidate caches
    const { CacheService } = await import('../../shared/cache/cache.service');
    await CacheService.invalidatePattern('appointments:*');
    await CacheService.invalidatePattern('dashboard:*');

    return appointment;
  }
}
