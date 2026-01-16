import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsDateString } from 'class-validator'

/**
 * DTO for creating a bill for a student based on a billing configuration.
 */
export class CreateBillDto {
  @ApiProperty({
    description: 'Unique ID of the student for whom the bill is created',
    example: 101,
  })
  @IsInt()
  studentId: number

  @ApiProperty({
    description:
      'ID of the billing configuration used to generate this bill',
    example: 5,
  })
  @IsInt()
  billConfigId: number

  @ApiProperty({
    description:
      'Payment due date in ISO 8601 format (YYYY-MM-DD)',
    example: '2026-01-31',
  })
  @IsDateString()
  dueDate: string
}
