import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  /* ================= CREATE ================= */
  @Post()
  @ApiOperation({
    summary:
      'Create notification (DB + WebSocket + optional Email)',
  })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  /* ================= GET MY NOTIFICATIONS ================= */
  @Get()
  @ApiOperation({
    summary: 'Get logged-in user notifications (paginated)',
  })
  async getMyNotifications(
    @Req() req: any,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.findByUser(
      req.user.id,
      query,
    );
  }

  /* ================= MARK ONE AS READ ================= */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read (own)' })
  async markAsRead(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(
      Number(id),
      req.user.id,
    );
  }

  /* ================= MARK ALL AS READ ================= */
  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read (own)',
  })
  async markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
