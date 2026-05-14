import { AppError } from '../../middlewares/errorHandler';
import Invoice from '../../models/Invoice';
import Appointment from '../../models/Appointment';
import { Product } from '../../models/Product';
import { User } from '../../models/User';

import { CacheService } from '../../shared/cache/cache.service';

export class AnalyticsService {
  async getDashboardMetrics(shopId: string) {
    try {
      const cacheKey = `dashboard:${shopId}`;
      const cachedData = await CacheService.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const now = new Date();
      
      // Date range calculations
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // 1. Daily Revenue (Today)
      const dailyInvoices = await Invoice.find({
        shopId,
        createdAt: { $gte: todayStart }
      });
      const todayRevenue = dailyInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

      // 2. Monthly Revenue
      const monthlyInvoices = await Invoice.find({
        shopId,
        createdAt: { $gte: monthStart }
      });
      const monthlyRevenue = monthlyInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

      // 3. Service & Appointments count
      const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
      const activeAppointments = await Appointment.countDocuments({ status: { $in: ['in-progress', 'confirmed'] } });
      const completedAppointmentsMonth = await Appointment.countDocuments({ 
        status: 'completed',
        updatedAt: { $gte: monthStart }
      });

      // 4. Low Stock Products
      const lowStockThreshold = 5;
      const lowStockProducts = await Product.find({
        shopId,
        stockQty: { $lte: lowStockThreshold }
      }).limit(5).select('name stockQty productCode');

      // 5. Total Customers
      const totalCustomers = await User.countDocuments({ role: 'customer' });

      // 6. Chart Data - Last 7 Days Revenue
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);

        const dailyRev = await Invoice.aggregate([
          { 
            $match: { 
              shopId: shopId as any, // Mongoose aggregate type conversion
              createdAt: { $gte: d, $lt: nextDay } 
            } 
          },
          { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ]);

        last7Days.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dailyRev.length > 0 ? dailyRev[0].total : 0
        });
      }

      const responseData = {
        metrics: {
          todayRevenue,
          monthlyRevenue,
          pendingAppointments,
          activeAppointments,
          completedAppointmentsMonth,
          totalCustomers
        },
        lowStockProducts,
        revenueChart: last7Days
      };

      // Cache for 30 minutes (1800 seconds)
      await CacheService.set(cacheKey, responseData, 1800);

      return responseData;
    } catch (error) {
      throw new AppError('Failed to fetch analytics', 500);
    }
  }
}
