// src/modules/billing/dto/find-bills-by-student.dto.ts

import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min } from 'class-validator'

/**
 * DTO for retrieving a paginated list of bills for a specific student.
 */
export class FindBillsByStudentDto {
  @ApiProperty({
    description: 'Unique ID of the student whose bills are being retrieved',
    example: 101,
  })
  @IsInt()
  studentId: number

  @ApiProperty({
    description:
      'Page number for pagination (starting from 1)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  page: number

  @ApiProperty({
    description:
      'Number of records to return per page',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  limit: number
}
