import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  DIRECT = 'DIRECT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  HOMEWORK = 'HOMEWORK',
}

export class CreateMessageDto {
  @ApiProperty({
    example: 12,
    description:
      'ID of the user sending the message. Must be an authenticated system user (Teacher, Admin, or Guardian).',
  })
  @IsInt()
  senderId: number;

  @ApiPropertyOptional({
    example: 45,
    description:
      'ID of the receiving user. Leave NULL when sending a broadcast message or school-wide announcement.',
  })
  @IsOptional()
  @IsInt()
  receiverId?: number;

  @ApiProperty({
    example: 'Student has shown great improvement in mathematics this week.',
    maxLength: 1000,
    description:
      'Message content. Maximum length is 1000 characters. Used for direct messages, announcements, or progress updates.',
  })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    enum: MessageType,
    example: MessageType.PROGRESS_UPDATE,
    description:
      'Defines the purpose of the message, such as a direct chat, announcement, homework sharing, or student progress update.',
  })
  @IsEnum(MessageType)
  messageType: MessageType;
}
