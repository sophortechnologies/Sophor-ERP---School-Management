import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create calendar event' })
  create(
    @Body() dto: CreateCalendarEventDto,
    @Req() req: any,
  ) {
    return this.calendarService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all calendar events' })
  findAll(@Query() query: CalendarQueryDto) {
    return this.calendarService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single calendar event' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.calendarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update calendar event' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete calendar event' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.calendarService.remove(id);
  }
}
