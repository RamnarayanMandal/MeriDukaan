import Service, { IService } from '../../models/Service';
import { AppError } from '../../middlewares/errorHandler';

export class ServiceModuleService {
  /**
   * Create a new service
   */
  async createService(serviceData: Partial<IService>): Promise<IService> {
    const existingService = await Service.findOne({ name: serviceData.name });
    if (existingService) {
      throw new AppError('Service with this name already exists', 400);
    }
    const service = await Service.create(serviceData);
    
    // Invalidate Cache
    const { CacheService } = await import('../../shared/cache/cache.service');
    await CacheService.invalidatePattern('services:*');
    
    return service;
  }

  /**
   * Get all services with optional filtering and pagination
   */
  async getAllServices(query: any) {
    const { page = 1, limit = 10, category, isActive, search } = query;
    
    // Check Cache
    const cacheKey = `services:${category || 'all'}:${isActive || 'all'}:${search || ''}:${page}:${limit}`;
    const { CacheService } = await import('../../shared/cache/cache.service');
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const { PaginationUtil } = await import('../../shared/pagination/pagination.util');
    const paginatedResult = await PaginationUtil.paginate(Service, filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 }
    });

    const result = {
      services: paginatedResult.data,
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
      meta: paginatedResult.meta
    };

    // Cache for 1 hour
    await CacheService.set(cacheKey, result, 3600);

    return result;
  }

  /**
   * Get a single service by ID
   */
  async getServiceById(id: string): Promise<IService> {
    const service = await Service.findById(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    return service;
  }

  /**
   * Update a service
   */
  async updateService(id: string, updateData: Partial<IService>): Promise<IService> {
    const service = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Invalidate Cache
    const { CacheService } = await import('../../shared/cache/cache.service');
    await CacheService.invalidatePattern('services:*');

    return service;
  }

  /**
   * Delete a service (Soft delete by setting isActive to false is recommended, but here we do actual delete)
   */
  async deleteService(id: string): Promise<void> {
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Invalidate Cache
    const { CacheService } = await import('../../shared/cache/cache.service');
    await CacheService.invalidatePattern('services:*');
  }
}
