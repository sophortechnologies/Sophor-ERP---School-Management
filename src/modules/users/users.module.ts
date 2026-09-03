import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilePhotoController } from './profile-photo.controller';
import { UploadService } from '../../common/services/upload.service';

// PermissionService is provided by AuthModule (@Global) — no need to re-provide it here.
// Re-providing it would create a second instance with a split permission cache.

@Module({
  providers: [
    UsersService,
    UploadService,
  ],
  controllers: [
    UsersController,
    ProfilePhotoController,
  ],
  exports: [UsersService],
})
export class UsersModule {}
