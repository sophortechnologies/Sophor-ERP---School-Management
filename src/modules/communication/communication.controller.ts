// communication.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send message or announcement' })
  sendMessage(@Body() dto: CreateMessageDto) {
    return this.service.sendMessage(dto);
  }

  @Get('inbox/:userId')
  @ApiOperation({ summary: 'Get inbox messages (including announcements)' })
  getInbox(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getInbox(userId);
  }

  @Get('conversation/:senderId/:receiverId')
  @ApiOperation({ summary: 'Get conversation between two users' })
  getConversation(
    @Param('senderId', ParseIntPipe) senderId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ) {
    return this.service.getConversation(senderId, receiverId);
  }

 @Patch(':id/read')
@ApiOperation({ summary: 'Mark message as read' })
markAsRead(
  @Param('id', ParseIntPipe) id: number,
  @Req() req,
) {
  return this.service.markAsRead(id, req.user.id);
}

@Get('unread/:userId')
@ApiOperation({ summary: 'Get unread message count' })
async getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
  return this.service.getUnreadCount(userId);
}

@Delete(':id')
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF')
@ApiOperation({ summary: 'Delete a message' })
async deleteMessage(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
) {
  return this.service.deleteMessage(id, req.user.id, req.user.role?.name);
}

}
