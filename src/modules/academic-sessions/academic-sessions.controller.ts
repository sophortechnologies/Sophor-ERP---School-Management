import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
@ApiTags('Academic Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(private readonly academicSessionsService: AcademicSessionsService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new academic session' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Academic session created successfully' 
  })
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionsService.create(createAcademicSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all academic sessions' })
  findAll() {
    return this.academicSessionsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active academic session' })
  findActive() {
    return this.academicSessionsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic session by ID' })
  findOne(@Param('id') id: string) {
    return this.academicSessionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update academic session' })
  update(
    @Param('id') id: string,
    @Body() updateAcademicSessionDto: UpdateAcademicSessionDto,
  ) {
    return this.academicSessionsService.update(id, updateAcademicSessionDto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Set academic session as active' })
  setActive(@Param('id') id: string) {
    return this.academicSessionsService.setActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete academic session' })
  remove(@Param('id') id: string) {
    return this.academicSessionsService.remove(id);
  }
}