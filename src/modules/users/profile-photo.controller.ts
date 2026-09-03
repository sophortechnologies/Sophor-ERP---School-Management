import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { UploadService } from '../../common/services/upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Profile Photo')
@ApiBearerAuth()
@Controller('profile-photo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfilePhotoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // ==================== FOR CURRENT USER ====================

  @Post('me')
  @UseInterceptors(FileInterceptor('photo', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadMyPhoto(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const photoUrl = `/uploads/profile-photos/${file.filename}`;

    // Update user profile image
    const user = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: photoUrl },
    });

    return {
      message: 'Profile photo uploaded successfully',
      profileImage: user.profileImage,
    };
  }
@Put('me')
@UseInterceptors(FileInterceptor('photo', {
  limits: { fileSize: 5 * 1024 * 1024 },
}))
@ApiConsumes('multipart/form-data')
async updateMyPhoto(@UploadedFile() file: Express.Multer.File, @Req() req) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // Get current user to delete old photo
  const currentUser = await this.prisma.user.findUnique({
    where: { id: req.user.id },
  });

  // Delete old photo file if exists
  if (currentUser?.profileImage) {
    const oldPath = path.join(process.cwd(), currentUser.profileImage);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Save new photo
  const photoUrl = `/uploads/profile-photos/${file.filename}`;

  const user = await this.prisma.user.update({
    where: { id: req.user.id },
    data: { profileImage: photoUrl },
  });

  return {
    message: 'Profile photo updated successfully',
    oldPhoto: currentUser?.profileImage,
    newPhoto: user.profileImage,
  };
}

  @Delete('me')
  async deleteMyPhoto(@Req() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.profileImage) {
      throw new NotFoundException('No profile photo found');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), user.profileImage);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: null },
    });

    return { message: 'Profile photo deleted successfully' };
  }

  // ==================== FOR ADMIN (Manage any user) ====================

  @Post('user/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @UseInterceptors(FileInterceptor('photo', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  async uploadUserPhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const photoUrl = `/uploads/profile-photos/${file.filename}`;

    const user = await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { profileImage: photoUrl },
    });

    return {
      message: 'Profile photo uploaded successfully',
      userId: user.id,
      profileImage: user.profileImage,
    };
  }

  @Delete('user/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async deleteUserPhoto(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user?.profileImage) {
      throw new NotFoundException('No profile photo found');
    }

    const filePath = path.join(process.cwd(), user.profileImage);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: { profileImage: null },
    });

    return { message: 'Profile photo deleted successfully' };
  }

  // ==================== GET PHOTO ====================

  @Get('user/:userId')
  async getUserPhoto(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { profileImage: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: parseInt(userId),
      name: `${user.firstName} ${user.lastName}`,
      profileImage: user.profileImage || null,
      hasPhoto: !!user.profileImage,
    };
  }

  @Get('me/info')
  async getMyPhotoInfo(@Req() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profileImage: true, firstName: true, lastName: true, email: true },
    });

    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      profileImage: user.profileImage || null,
      hasPhoto: !!user.profileImage,
    };
  }
}