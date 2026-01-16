import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { BillStatus } from '../enums/bill-status.enum'

/**
 * DTO for updating the status of a bill.
 */
export class UpdateBillStatusDto {
  @ApiProperty({
    description:
      'New status of the bill. Allowed values depend on the BillStatus enum',
    enum: BillStatus,
    example: BillStatus.PAID,
  })
  @IsEnum(BillStatus)
  status: BillStatus
}
