import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';

  constructor() {
    // Ensure upload directories exist
    const dirs = [
      './uploads/profile-photos',
      './uploads/student-documents',
      './uploads/employee-documents',
      './uploads/payslips',
      './uploads/bank-files',
    ];
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  getProfilePhotoStorage() {
    return diskStorage({
      destination: './uploads/profile-photos',
      filename: (req, file, cb) => {
        const userId = (req as any).user?.id || 'anonymous';
        const uniqueId = uuidv4();
        const ext = extname(file.originalname);
        cb(null, `user-${userId}-${uniqueId}${ext}`);
      },
    });
  }

  getDocumentStorage(folder: string) {
    return diskStorage({
      destination: `./uploads/${folder}`,
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = extname(file.originalname);
        const originalName = file.originalname.replace(/\s/g, '_');
        cb(null, `${uniqueId}-${originalName}`);
      },
    });
  }

  getFileFilter(allowedTypes: string[]) {
    return (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(`File type ${ext} not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
      }
    };
  }

  getImageFileFilter() {
    return this.getFileFilter(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  }

  getDocumentFileFilter() {
    return this.getFileFilter(['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']);
  }
}