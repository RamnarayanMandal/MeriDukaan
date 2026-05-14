import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { ServiceModuleService } from './service.service';

const serviceModuleService = new ServiceModuleService();

export const ServiceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceModuleService.createService(req.body);
    ResponseHandler.created(res, 'Service created successfully', service);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { services, total, page, limit } = await serviceModuleService.getAllServices(req.query);
    ResponseHandler.paginated(res, 'Services retrieved successfully', services, page, limit, total);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceModuleService.getServiceById(req.params.id);
    ResponseHandler.success(res, 'Service retrieved successfully', service);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceModuleService.updateService(req.params.id, req.body);
    ResponseHandler.success(res, 'Service updated successfully', service);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await serviceModuleService.deleteService(req.params.id);
    ResponseHandler.success(res, 'Service deleted successfully');
  }),
};
