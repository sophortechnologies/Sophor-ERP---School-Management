import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum DocumentType {
  ID_PROOF = 'ID_PROOF',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  TRANSCRIPT = 'TRANSCRIPT',
  PHOTO = 'PHOTO',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @IsOptional()
  description?: string;
}