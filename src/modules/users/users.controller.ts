
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

import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* =========================
     ✅ PUBLIC LOGIN
     ========================= */

  /* =========================
     ✅ PROTECTED ROUTES
     ========================= */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // findAll(@Query() query: FilterUserDto) {
  //   return this.usersService.findAll(query);
  // }

  @Get()
findAll(@Query() query: any, @Req() req: Request) {
  return this.usersService.findAll(
    query,
    `${req.protocol}://${req.get('host')}${req.path}`,
  );
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.activate(id);
  }
}
