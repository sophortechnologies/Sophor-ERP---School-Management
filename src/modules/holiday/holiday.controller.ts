import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@ApiTags('Holidays')
@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @ApiOperation({ summary: 'Create a holiday' })
  @ApiResponse({ status: 201, description: 'Holiday created successfully' })
  create(@Body() dto: CreateHolidayDto) {
    return this.holidayService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get holidays (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'page_size', required: false, example: 10 })
  @ApiQuery({ name: 'academicSessionId', required: false, example: 1 })
  findAll(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Query('academicSessionId') academicSessionId?: string,
  ) {
    return this.holidayService.findAllPaginated(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
      academicSessionId ? Number(academicSessionId) : undefined,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a holiday' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.holidayService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a holiday' })
  remove(@Param('id') id: string) {
    return this.holidayService.remove(Number(id));
  }
}
