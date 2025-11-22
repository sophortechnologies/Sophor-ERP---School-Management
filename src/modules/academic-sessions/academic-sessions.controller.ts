
// // import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
// // import { AcademicSessionsService } from './academic-sessions.service';
// // import { CreateAcademicSessionDto, UpdateAcademicSessionDto } from './dto/create-academic-session.dto';
// // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// // import { RolesGuard } from '../../common/guards/roles.guard';
// // import { Roles } from '../../common/decorators/roles.decorator';

// // @Controller('academic-sessions')
// // @UseGuards(JwtAuthGuard, RolesGuard)
// // export class AcademicSessionsController {
// //   constructor(private readonly academicSessionsService: AcademicSessionsService) {}

// //   @Post()
// //   @Roles('ADMIN', 'REGISTRAR')
// //   create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
// //     return this.academicSessionsService.create(createAcademicSessionDto);
// //   }

// //   @Get()
// //   @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
// //   findAll() {
// //     return this.academicSessionsService.findAll();
// //   }

// //   @Get('active')
// //   @Roles('ADMIN', 'REGISTRAR', 'TEACHER', 'STUDENT')
// //   findActive() {
// //     return this.academicSessionsService.findActive();
// //   }

// //   @Get(':id')
// //   @Roles('ADMIN', 'REGISTRAR')
// //   findOne(@Param('id', ParseIntPipe) id: number) {
// //     return this.academicSessionsService.findOne(id);
// //   }

// //   @Put(':id')
// //   @Roles('ADMIN', 'REGISTRAR')
// //   update(
// //     @Param('id', ParseIntPipe) id: number, 
// //     @Body() updateAcademicSessionDto: UpdateAcademicSessionDto
// //   ) {
// //     return this.academicSessionsService.update(id, updateAcademicSessionDto);
// //   }

// //   @Put(':id/activate')
// //   @Roles('ADMIN', 'REGISTRAR')
// //   activate(@Param('id', ParseIntPipe) id: number) {
// //     return this.academicSessionsService.activate(id);
// //   }

// //   @Delete(':id')
// //   @Roles('ADMIN')
// //   remove(@Param('id', ParseIntPipe) id: number) {
// //     return this.academicSessionsService.remove(id);
// //   }
// // }
// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { AcademicSessionsService } from './academic-sessions.service';
// import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
// import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';

// @ApiTags('academic-sessions')
// @ApiBearerAuth()
// @Controller('academic-sessions')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class AcademicSessionsController {
//   constructor(private readonly academicSessionsService: AcademicSessionsService) {}

//   @Post()
//   @Roles('ADMIN')
//   @ApiOperation({ summary: 'Create academic session' })
//   @ApiResponse({ status: 201, description: 'Academic session created successfully' })
//   create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
//     return this.academicSessionsService.create(createAcademicSessionDto);
//   }

//   @Get()
//   @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
//   @ApiOperation({ summary: 'Get all academic sessions' })
//   @ApiResponse({ status: 200, description: 'Academic sessions retrieved successfully' })
//   findAll() {
//     return this.academicSessionsService.findAll();
//   }

//   @Get('current')
//   @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
//   @ApiOperation({ summary: 'Get current academic session' })
//   @ApiResponse({ status: 200, description: 'Current academic session retrieved successfully' })
//   findCurrent() {
//     return this.academicSessionsService.findCurrent();
//   }

//   @Get(':id')
//   @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
//   @ApiOperation({ summary: 'Get academic session by ID' })
//   @ApiResponse({ status: 200, description: 'Academic session retrieved successfully' })
//   @ApiResponse({ status: 404, description: 'Academic session not found' })
//   findOne(@Param('id') id: string) {
//     return this.academicSessionsService.findOne(id);
//   }

//   @Patch(':id')
//   @Roles('ADMIN')
//   @ApiOperation({ summary: 'Update academic session' })
//   @ApiResponse({ status: 200, description: 'Academic session updated successfully' })
//   @ApiResponse({ status: 404, description: 'Academic session not found' })
//   update(@Param('id') id: string, @Body() updateAcademicSessionDto: UpdateAcademicSessionDto) {
//     return this.academicSessionsService.update(id, updateAcademicSessionDto);
//   }

//   @Delete(':id')
//   @Roles('ADMIN')
//   @ApiOperation({ summary: 'Delete academic session' })
//   @ApiResponse({ status: 200, description: 'Academic session deleted successfully' })
//   @ApiResponse({ status: 404, description: 'Academic session not found' })
//   remove(@Param('id') id: string) {
//     return this.academicSessionsService.remove(id);
//   }

//   @Patch(':id/set-current')
//   @Roles('ADMIN')
//   @ApiOperation({ summary: 'Set academic session as current' })
//   @ApiResponse({ status: 200, description: 'Academic session set as current successfully' })
//   @ApiResponse({ status: 404, description: 'Academic session not found' })
//   setCurrent(@Param('id') id: string) {
//     return this.academicSessionsService.setCurrent(id);
//   }
// }

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('academic-sessions')
@ApiBearerAuth()
@Controller('academic-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicSessionsController {
  constructor(private readonly academicSessionsService: AcademicSessionsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create academic session' })
  @ApiResponse({ status: 201, description: 'Academic session created successfully' })
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionsService.create(createAcademicSessionDto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
  @ApiOperation({ summary: 'Get all academic sessions' })
  @ApiResponse({ status: 200, description: 'Academic sessions retrieved successfully' })
  findAll() {
    return this.academicSessionsService.findAll();
  }

  @Get('current')
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR', 'STUDENT')
  @ApiOperation({ summary: 'Get current academic session' })
  @ApiResponse({ status: 200, description: 'Current academic session retrieved successfully' })
  findCurrent() {
    return this.academicSessionsService.findCurrent();
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'REGISTRAR')
  @ApiOperation({ summary: 'Get academic session by ID' })
  @ApiResponse({ status: 200, description: 'Academic session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Academic session not found' })
  findOne(@Param('id') id: string) {
    return this.academicSessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update academic session' })
  @ApiResponse({ status: 200, description: 'Academic session updated successfully' })
  @ApiResponse({ status: 404, description: 'Academic session not found' })
  update(@Param('id') id: string, @Body() updateAcademicSessionDto: UpdateAcademicSessionDto) {
    return this.academicSessionsService.update(id, updateAcademicSessionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete academic session' })
  @ApiResponse({ status: 200, description: 'Academic session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Academic session not found' })
  remove(@Param('id') id: string) {
    return this.academicSessionsService.remove(id);
  }

  @Patch(':id/set-current')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Set academic session as current' })
  @ApiResponse({ status: 200, description: 'Academic session set as current successfully' })
  @ApiResponse({ status: 404, description: 'Academic session not found' })
  setCurrent(@Param('id') id: string) {
    return this.academicSessionsService.setCurrent(id);
  }
}