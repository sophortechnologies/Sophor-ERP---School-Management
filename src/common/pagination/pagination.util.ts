import { PaginationDto } from './pagination.dto';
import { PaginatedResponse } from './pagination.interface';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  dto: PaginationDto,
): PaginatedResponse<T> {
  const { page, limit } = dto;
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