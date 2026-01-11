import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationStatusDto {
  @ApiProperty({
    description: 'New status of the notification (e.g. READ, UNREAD)',
    example: 'READ',
  })
  @IsString()
  status: string;
}
