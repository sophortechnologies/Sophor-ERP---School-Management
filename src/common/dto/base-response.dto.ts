import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API Response Format
 */
export class BaseResponseDto<T> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  data!: T;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  timestamp!: string;
}

/**
 * Paginated Response Format
 */
export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ApiProperty()
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}