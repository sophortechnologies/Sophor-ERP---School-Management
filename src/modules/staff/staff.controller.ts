import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Delete
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN','ADMIN')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Post('register')
register(@Body() dto: RegisterStaffDto) {
  return this.staffService.register(dto);
}


  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, dto);
  }

  @Put(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deactivate(id);
  }

 @Delete(':id')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.staffService.remove(id);
}
@Delete(':id/hard')
@Roles('SUPER_ADMIN', 'ADMIN')

hardDelete(@Param('id', ParseIntPipe) id: number) {
  return this.staffService.hardDelete(id);
}

}
