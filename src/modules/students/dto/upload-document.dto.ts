// import { IsString, IsEnum, IsOptional } from 'class-validator';

// export enum DocumentType {
//   ID_PROOF = 'ID_PROOF',
//   BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
//   TRANSCRIPT = 'TRANSCRIPT',
//   PHOTO = 'PHOTO',
//   MEDICAL_RECORD = 'MEDICAL_RECORD',
//   OTHER = 'OTHER',
// }

// export class UploadDocumentDto {
//   @IsEnum(DocumentType)
//   documentType: DocumentType;

//   @IsString()
//   @IsOptional()
//   description?: string;
// }

import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ 
    enum: [
      'BIRTH_CERTIFICATE', 
      'TRANSFER_CERTIFICATE', 
      'PHOTO', 
      'ID_PROOF',
      'MEDICAL_CERTIFICATE',
      'ADMISSION_FORM',
      'OTHER'
    ] 
  })
  @IsEnum([
    'BIRTH_CERTIFICATE', 
    'TRANSFER_CERTIFICATE', 
    'PHOTO', 
    'ID_PROOF',
    'MEDICAL_CERTIFICATE',
    'ADMISSION_FORM',
    'OTHER'
  ])
  documentType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}