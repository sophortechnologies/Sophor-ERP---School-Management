import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode
} from '@nestjs/common';
import { AssignParentDto } from './dto/assign-parent.dto';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
@ApiTags("Admin")
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async dashboard(@Query() query: any) {
    return this.service.getDashboard(query);
  }

  @Get('users')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async users(@Query() query: any) {
    const page = Number(query.page) || 1;
    const page_size = Number(query.page_size) || 20;
    return this.service.usersList(page, page_size);
  }

 @Post('assign-parent')
@Roles('SUPER_ADMIN', 'ADMIN')
@HttpCode(201)
assignParentToStudent(@Body() dto: AssignParentDto) {
  return this.service.linkParentToStudent(dto);
}

}
