import { IsInt, IsString, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    example: 'math-progress-report.pdf',
    description:
      'Original name of the uploaded file as provided by the sender.',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'https://cdn.school-system.com/uploads/math-report.pdf',
    description:
      'Public or secured URL where the attachment is stored after upload.',
  })
  @IsString()
  fileUrl: string;

  @ApiProperty({
    example: 'application/pdf',
    description:
      'MIME type of the uploaded file (e.g., application/pdf, image/png).',
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    example: 524288,
    description:
      'File size in bytes. Maximum allowed size is 10 MB.',
  })
  @IsInt()
  @Max(10 * 1024 * 1024)
  fileSize: number;
}
