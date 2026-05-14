import { Document, Model, FilterQuery } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: any;
  select?: string;
  populate?: any;
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginationUtil {
  /**
   * Helper to execute a paginated mongoose query
   */
  static async paginate<T extends Document>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    let query = model.find(filter).lean();

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.populate) {
      query = query.populate(options.populate);
    }

    query = query.skip(skip).limit(limit);

    const [data, total] = await Promise.all([
      query.exec() as Promise<T[]>,
      model.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  }

  /**
   * Helper to parse query params into PaginationOptions
   */
  static parseOptions(query: any): PaginationOptions {
    return {
      page: parseInt(query.page as string, 10) || 1,
      limit: parseInt(query.limit as string, 10) || 10,
      sort: query.sort || { createdAt: -1 },
    };
  }
}
