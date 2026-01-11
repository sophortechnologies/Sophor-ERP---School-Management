import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the user who will receive the notification',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional({
    description: 'Student ID if the notification is related to a specific student',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'ALERT',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Low Attendance Warning',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed message content of the notification',
    example: 'Your attendance is below the required threshold.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the notification should also be sent via email',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Email address to send the notification to (required if sendEmail is true)',
    example: 'student@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
