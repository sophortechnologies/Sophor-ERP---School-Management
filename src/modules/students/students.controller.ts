
// // // // import { 
// // // //   Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe, Patch 
// // // // } from '@nestjs/common';
// // // // import { StudentsService } from './students.service';
// // // // import { CreateStudentDto } from './dto/create-student.dto';
// // // // import { UpdateStudentDto } from './dto/update-student.dto';
// // // // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// // // // import { RolesGuard } from '../../common/guards/roles.guard';
// // // // import { Roles } from '../../common/decorators/roles.decorator';

// // // // @Controller('students')
// // // // @UseGuards(JwtAuthGuard, RolesGuard)
// // // // export class StudentsController {
// // // //   constructor(private readonly studentsService: StudentsService) {}

// // // //   @Post('admission')
// // // //   @Roles('ADMIN', 'REGISTRAR')
// // // //   createAdmission(@Body() createStudentDto: CreateStudentDto, @Body('userId') userId: string) {
// // // //     return this.studentsService.createStudentAdmission(createStudentDto, userId);
// // // //   }

// // // //   @Get()
// // // //   @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
// // // //   findAll() {
// // // //     return this.studentsService.findAll();
// // // //   }

// // // //   @Get(':id')
// // // //   @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
// // // //   findOne(@Param('id', ParseIntPipe) id: number) {
// // // //     return this.studentsService.findOne(id);
// // // //   }

// // // //   @Patch(':id')
// // // //   @Roles('ADMIN', 'REGISTRAR')
// // // //   update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
// // // //     return this.studentsService.update(id, updateStudentDto);
// // // //   }

// // // //   @Delete(':id')
// // // //   @Roles('ADMIN')
// // // //   remove(@Param('id', ParseIntPipe) id: number) {
// // // //     return this.studentsService.remove(id);
// // // //   }
// // // // }

// // // import { BulkUpdateDto } from './dto/bulk-update.dto';
// // // import { AdvancedSearchDto } from './dto/advanced-search.dto';
// // // import { StudentAdvancedService } from './student-advanced.service';

// // // // Add to constructor
// // // constructor(
// // //   private readonly studentsService: StudentsService,
// // //   private readonly studentAdvancedService: StudentAdvancedService,
// // // ) {}

// // // // Add these new endpoints:

// // // @Post('bulk-update')
// // // @Roles('ADMIN', 'REGISTRAR')
// // // @ApiOperation({ summary: 'Bulk update student status' })
// // // @ApiResponse({ status: 200, description: 'Students updated successfully' })
// // // bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDto) {
// // //   return this.studentAdvancedService.bulkUpdateStudentStatus(
// // //     bulkUpdateDto.studentIds,
// // //     bulkUpdateDto.status,
// // //   );
// // // }

// // // @Post('advanced-search')
// // // @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
// // // @ApiOperation({ summary: 'Advanced student search' })
// // // @ApiResponse({ status: 200, description: 'Search completed successfully' })
// // // advancedSearch(@Body() searchCriteria: AdvancedSearchDto) {
// // //   return this.studentAdvancedService.searchStudentsAdvanced(searchCriteria);
// // // }

// // // @Get(':id/academic-progress')
// // // @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
// // // @ApiOperation({ summary: 'Get student academic progress' })
// // // @ApiResponse({ status: 200, description: 'Academic progress retrieved successfully' })
// // // @ApiResponse({ status: 404, description: 'Student not found' })
// // // getAcademicProgress(@Param('id') id: string) {
// // //   return this.studentAdvancedService.getStudentAcademicProgress(id);
// // // }

// // // @Get(':id/timeline')
// // // @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
// // // @ApiOperation({ summary: 'Get student timeline' })
// // // @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
// // // @ApiResponse({ status: 404, description: 'Student not found' })
// // // getTimeline(@Param('id') id: string) {
// // //   return this.studentAdvancedService.getStudentTimeline(id);
// // // }

// // import {
// //   Controller,
// //   Get,
// //   Post,
// //   Body,
// //   Patch,
// //   Param,
// //   Delete,
// //   Query,
// //   UseInterceptors,
// //   UploadedFile,
// //   UseGuards,
// //   Req,
// // } from '@nestjs/common';
// // import { FileInterceptor } from '@nestjs/platform-express';
// // import {
// //   ApiTags,
// //   ApiOperation,
// //   ApiResponse,
// //   ApiConsumes,
// //   ApiBearerAuth,
// // } from '@nestjs/swagger';
// // import { StudentsService } from './students.service';
// // import { StudentAdvancedService } from './student-advanced.service';
// // import { CreateStudentDto } from './dto/create-student.dto';
// // import { UpdateStudentDto } from './dto/update-student.dto';
// // import { QueryStudentDto } from './dto/query-student.dto';
// // import { ClassAssignmentDto } from './dto/class-assignment.dto';
// // import { UploadDocumentDto } from './dto/upload-document.dto';
// // import { BulkUpdateDto } from './dto/bulk-update.dto';
// // import { AdvancedSearchDto } from './dto/advanced-search.dto';
// // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// // import { RolesGuard } from '../../common/guards/roles.guard';
// // import { Roles } from '../../common/decorators/roles.decorator';

// // @ApiTags('students')
// // @ApiBearerAuth()
// // @Controller('students')
// // @UseGuards(JwtAuthGuard, RolesGuard)
// // export class StudentsController {
// //   constructor(
// //     private readonly studentsService: StudentsService,
// //     private readonly studentAdvancedService: StudentAdvancedService,
// //   ) {}

// //   // ... all the existing endpoints ...

// //   @Post('bulk-update')
// //   @Roles('ADMIN', 'REGISTRAR')
// //   @ApiOperation({ summary: 'Bulk update student status' })
// //   @ApiResponse({ status: 200, description: 'Students updated successfully' })
// //   bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDto) {
// //     return this.studentAdvancedService.bulkUpdateStudentStatus(
// //       bulkUpdateDto.studentIds,
// //       bulkUpdateDto.status,
// //     );
// //   }

// //   @Post('advanced-search')
// //   @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
// //   @ApiOperation({ summary: 'Advanced student search' })
// //   @ApiResponse({ status: 200, description: 'Search completed successfully' })
// //   advancedSearch(@Body() searchCriteria: AdvancedSearchDto) {
// //     return this.studentAdvancedService.searchStudentsAdvanced(searchCriteria);
// //   }

// //   @Get(':id/academic-progress')
// //   @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
// //   @ApiOperation({ summary: 'Get student academic progress' })
// //   @ApiResponse({ status: 200, description: 'Academic progress retrieved successfully' })
// //   @ApiResponse({ status: 404, description: 'Student not found' })
// //   getAcademicProgress(@Param('id') id: string) {
// //     return this.studentAdvancedService.getStudentAcademicProgress(id);
// //   }

// //   @Get(':id/timeline')
// //   @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
// //   @ApiOperation({ summary: 'Get student timeline' })
// //   @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
// //   @ApiResponse({ status: 404, description: 'Student not found' })
// //   getTimeline(@Param('id') id: string) {
// //     return this.studentAdvancedService.getStudentTimeline(id);
// //   }
// // }

// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
// } from '@nestjs/swagger';
// import { StudentsService } from './students.service';
// import { CreateStudentDto } from './dto/create-student.dto';
// import { UpdateStudentDto } from './dto/update-student.dto';
// import { QueryStudentDto } from './dto/query-student.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';

// @ApiTags('students')
// @ApiBearerAuth()
// @Controller('students')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class StudentsController {
//   constructor(private readonly studentsService: StudentsService) {}

//   @Post()
//   @Roles('ADMIN', 'REGISTRAR')
//   @ApiOperation({ summary: 'Create a new student' })
//   @ApiResponse({ status: 201, description: 'Student created successfully' })
//   create(@Body() createStudentDto: CreateStudentDto) {
//     return this.studentsService.create(createStudentDto);
//   }

//   @Get()
//   @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
//   @ApiOperation({ summary: 'Get all students with pagination and filtering' })
//   @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
//   findAll(@Query() query: QueryStudentDto) {
//     return this.studentsService.findAll(query);
//   }

//   @Get(':id')
//   @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
//   @ApiOperation({ summary: 'Get student by ID' })
//   @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
//   @ApiResponse({ status: 404, description: 'Student not found' })
//   findOne(@Param('id') id: string) {
//     return this.studentsService.findOne(id);
//   }

//   @Patch(':id')
//   @Roles('ADMIN', 'REGISTRAR')
//   @ApiOperation({ summary: 'Update student information' })
//   @ApiResponse({ status: 200, description: 'Student updated successfully' })
//   update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
//     return this.studentsService.update(id, updateStudentDto);
//   }

//   @Delete(':id')
//   @Roles('ADMIN')
//   @ApiOperation({ summary: 'Deactivate student' })
//   @ApiResponse({ status: 200, description: 'Student deactivated successfully' })
//   remove(@Param('id') id: string) {
//     return this.studentsService.remove(id);
//   }
// }

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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
  @ApiOperation({ summary: 'Get all students with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  findAll(@Query() query: QueryStudentDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'REGISTRAR')
  @ApiOperation({ summary: 'Update student information' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate student' })
  @ApiResponse({ status: 200, description: 'Student deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}