import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsInt, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({
    name: 'page_size',
    example: 10,
    description: 'Number of records per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page_size: number = 10

  @ApiPropertyOptional({ enum: NotificationStatus })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus
}
