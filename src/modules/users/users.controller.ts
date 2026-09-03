
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  findAll(@Query() query: any, @Req() req: Request) {
    return this.usersService.findAll(
      query,
      `${req.protocol}://${req.get('host')}${req.path}`,
    );
  }

  @Get('roles')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all roles' })
  getRoles() {
    return this.usersService.getRoles();
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get user statistics' })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, req.user.id);
  }

  @Delete(':id/deactivate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate user' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }

  @Post(':id/activate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Activate user' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.activate(id);
  }

  @Post(':id/permissions')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Assign permission to user (super admin only)' })
  async assignPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionCode: string; isGranted: boolean },
  ) {
    return this.usersService.assignPermissionToUser(
      id,
      body.permissionCode,
      body.isGranted,
    );
  }

  @Delete(':id/permissions/:permissionCode')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Remove permission from user (super admin only)' })
  async removePermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissionCode') permissionCode: string,
  ) {
    return this.usersService.removePermissionFromUser(id, permissionCode);
  }

  @Get(':id/permissions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all permissions for a user' })
  async getUserPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserPermissionsWithSources(id);
  }
}
