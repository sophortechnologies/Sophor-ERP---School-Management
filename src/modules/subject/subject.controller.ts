
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('Subjects')

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}
  
  /** -------------------- CREATE -------------------- **/
  @Post()
  create(@Body() dto: CreateSubjectDto, @Req() req) {
    const userId = req.user?.id;
    return this.subjectService.create(dto, userId);
  }

  /** -------------------- GET ALL -------------------- **/
  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  /** -------------------- GET ONE -------------------- **/
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id);
  }

  /** -------------------- UPDATE -------------------- **/
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.subjectService.update(id, dto, userId);
  }

  /** -------------------- DELETE -------------------- **/
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id);
  }
}
