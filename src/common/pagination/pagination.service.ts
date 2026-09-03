import { Injectable } from '@nestjs/common';
import { PaginationDto } from './pagination.dto';
import { PaginatedResponse, PaginationOptions } from './pagination.interface';

@Injectable()
export class PaginationService {
  async paginate<T>(
    model: any,
    dto: PaginationDto,
    options: PaginationOptions = {},
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, sortBy, sortOrder, search } = dto;
    const skip = (page - 1) * limit;

    let where = options.where || {};

    if (search && options.searchFields && options.searchFields.length > 0) {
      where = {
        ...where,
        OR: options.searchFields.map(field => ({
          [field]: { contains: search, mode: 'insensitive' }
        }))
      };
    }

    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where,
        orderBy: { [sortBy]: sortOrder },
        include: options.include,
        select: options.select,
      }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}