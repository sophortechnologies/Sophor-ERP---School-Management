
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentAdmissionDto } from './dto/create-student-admission.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';
import { BulkAdmissionDto } from './dto/bulk-admission.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  create(@Body() createStudentDto: CreateStudentAdmissionDto, @Req() request: Request) {
    const userId = (request as any).user?.id || 'system';
    return this.studentsService.create(createStudentDto, userId);
  }

  @Post('bulk')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Create multiple students in bulk' })
  @ApiResponse({ status: 201, description: 'Bulk admission completed' })
  bulkCreate(@Body() bulkAdmissionDto: BulkAdmissionDto, @Req() request: Request) {
    const userId = (request as any).user?.id || 'system';
    return this.studentsService.bulkCreate(bulkAdmissionDto, userId);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
  @ApiOperation({ summary: 'Get all students with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  findAll(@Query() query: QueryStudentDto) {
    return this.studentsService.findAll(query);
  }

  @Get('stats')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Get admission statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Query('sessionId') sessionId?: string) {
    return this.studentsService.getAdmissionStats(sessionId);
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/admission-history')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Get student admission history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  getAdmissionHistory(@Param('id') id: string) {
    return this.studentsService.getAdmissionHistory(id);
  }

  @Get('student-id/:studentId')
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
  @ApiOperation({ summary: 'Get student by student ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  findByStudentId(@Param('studentId') studentId: string) {
    return this.studentsService.findByStudentId(studentId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto, @Req() request: Request) {
    const userId = (request as any).user?.id || 'system';
    return this.studentsService.update(id, updateStudentDto, userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Change student status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  changeStatus(@Param('id') id: string, @Body('status') status: string, @Req() request: Request) {
    const userId = (request as any).user?.id || 'system';
    return this.studentsService.changeStatus(id, status, userId);
  }

  @Post(':id/generate-confirmation')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Generate admission confirmation' })
  @ApiResponse({ status: 200, description: 'Confirmation generated successfully' })
  generateConfirmation(@Param('id') id: string) {
    return this.studentsService.generateAdmissionConfirmation(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate student' })
  @ApiResponse({ status: 200, description: 'Student deactivated successfully' })
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = (request as any).user?.id || 'system';
    return this.studentsService.remove(id, userId);
  }
}