import { IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiPropertyOptional({
    example: 12,
    description:
      'Filter messages sent by a specific user. Commonly used for audit logs or conversation filtering.',
  })
  @IsOptional()
  @IsInt()
  senderId?: number;

  @ApiPropertyOptional({
    example: 45,
    description:
      'Filter messages received by a specific user. Used to retrieve inbox messages or announcements.',
  })
  @IsOptional()
  @IsInt()
  receiverId?: number;
}
