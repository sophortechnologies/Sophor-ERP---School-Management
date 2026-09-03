import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Holidays')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a holiday' })
  create(@Body() dto: CreateHolidayDto) {
    return this.holidayService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get holidays (paginated)' })
  async findAll(
    @Query('page') page: string,
    @Query('page_size') pageSize: string,
    @Query('academicSessionId') academicSessionId: string,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.holidayService.findAllPaginated(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
      academicSessionId ? Number(academicSessionId) : undefined,
      baseUrl,
    );
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a holiday' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.holidayService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a holiday' })
  remove(@Param('id') id: string) {
    return this.holidayService.remove(Number(id));
  }
}