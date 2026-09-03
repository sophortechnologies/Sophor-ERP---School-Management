import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

@Injectable()
export class AcademicSessionsService {
  constructor(private prisma: PrismaService) {}

  private parseId(id: string): number {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return numericId;
  }

async create(createAcademicSessionDto: CreateAcademicSessionDto) {
  const startDate = new Date(createAcademicSessionDto.startDate);
  const endDate = new Date(createAcademicSessionDto.endDate);
  
  // FIX: Validate end date is after start date
  if (startDate >= endDate) {
    throw new BadRequestException('End date must be after start date');
  }
  
  // FIX: Prevent creating sessions in the past
  if (startDate < new Date()) {
    throw new BadRequestException('Start date cannot be in the past');
  }

  const overlappingSession = await this.prisma.academicSession.findFirst({
    where: {
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });

  if (overlappingSession) {
    throw new ConflictException('Academic session dates overlap with existing session');
  }

  if (createAcademicSessionDto.isActive) {
    await this.prisma.academicSession.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  return this.prisma.academicSession.create({
    data: {
      ...createAcademicSessionDto,
      startDate: startDate,
      endDate: endDate,
    },
  });
}
  async findAll(page: number = 1, pageSize: number = 10) {
    // Validate inputs
    page = Math.max(1, page);
    pageSize = Math.min(100, Math.max(1, pageSize));
    
    const skip = (page - 1) * pageSize;
    
    // Get total count
    const total = await this.prisma.academicSession.count();
    
    // Get paginated data
    const data = await this.prisma.academicSession.findMany({
      skip,
      take: pageSize,
      orderBy: { startDate: 'desc' },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / pageSize);
    const baseUrl = 'http://localhost:5000/academic-sessions';

    // Build response matching your standard format
    return {
      count: total,
      total_pages: totalPages,
      current_page: page,
      next: page < totalPages ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}` : null,
      previous: page > 1 ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}` : null,
      page_size: pageSize,
      data,
    };
  }

  async findActive() {
    return this.prisma.academicSession.findFirst({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const numericId = this.parseId(id);

    const session = await this.prisma.academicSession.findUnique({
      where: { id: numericId },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }

    return session;
  }

  async update(id: string, updateAcademicSessionDto: UpdateAcademicSessionDto) {
    const numericId = this.parseId(id);
    const existingSession = await this.findOne(id);


    if (updateAcademicSessionDto.startDate || updateAcademicSessionDto.endDate) {
      const startDate = updateAcademicSessionDto.startDate 
        ? new Date(updateAcademicSessionDto.startDate) 
        : existingSession.startDate;
      
      const endDate = updateAcademicSessionDto.endDate 
        ? new Date(updateAcademicSessionDto.endDate) 
        : existingSession.endDate;

      const overlappingSession = await this.prisma.academicSession.findFirst({
        where: {
          id: { not: numericId },
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      if (overlappingSession) {
        throw new ConflictException('Academic session dates overlap with existing session');
      }
    }


    if (updateAcademicSessionDto.isActive) {
      await this.prisma.academicSession.updateMany({
        where: { 
          isActive: true,
          id: { not: numericId }
        },
        data: { isActive: false },
      });
    }

    const updateData: any = { ...updateAcademicSessionDto };
    

    if (updateAcademicSessionDto.startDate) {
      updateData.startDate = new Date(updateAcademicSessionDto.startDate);
    }
    if (updateAcademicSessionDto.endDate) {
      updateData.endDate = new Date(updateAcademicSessionDto.endDate);
    }

    return this.prisma.academicSession.update({
      where: { id: numericId },
      data: updateData,
    });
  }

async remove(id: string) {
  const numericId = this.parseId(id);
  await this.findOne(id);
  
  const hasStudents = await this.prisma.student.count({
    where: { sessionId: numericId }
  });
  
  if (hasStudents > 0) {
    throw new BadRequestException(
      'Cannot delete academic session with enrolled students. Deactivate instead.'
    );
  }
  
  // FIX: Use transaction to clean up related records
  return this.prisma.$transaction(async (tx) => {
    await tx.holiday.deleteMany({
      where: { academicSessionId: numericId }
    });
    
    await tx.class.updateMany({
      where: { academicSessionId: numericId },
      data: { academicSessionId: null }
    });
    
    return tx.academicSession.delete({
      where: { id: numericId },
    });
  });
}
  async setActive(id: string) {
    const numericId = this.parseId(id);
    await this.findOne(id); // Check if exists

    // Deactivate all other sessions
    await this.prisma.academicSession.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the selected session
    return this.prisma.academicSession.update({
      where: { id: numericId },
      data: { isActive: true },
    });
  }

  /**
   * Get academic session statistics
   */
 async getStats(id: string) {
  const numericId = this.parseId(id);
  
  const [session, studentCount, classCount, examCount, holidayCount] = await Promise.all([
    this.prisma.academicSession.findUnique({
      where: { id: numericId },
    }),
    this.prisma.student.count({
      where: { sessionId: numericId }  // FIX: Only count students in this session
    }),
    this.prisma.class.count({
      where: { academicSessionId: numericId }  // FIX: Only count classes in this session
    }),
    this.prisma.exam.count({
      where: { academicSessionId: numericId }  // FIX: Only count exams in this session
    }),
    this.prisma.holiday.count({
      where: { academicSessionId: numericId }  // FIX: Only count holidays in this session
    }),
  ]);

  if (!session) {
    throw new NotFoundException('Academic session not found');
  }

  return {
    session,
    statistics: {
      studentCount,
      classCount,
      examCount,
      holidayCount,
      durationInDays: Math.ceil(
        (session.endDate.getTime() - session.startDate.getTime()) / (1000 * 3600 * 24)
      ),
      isCurrent: session.startDate <= new Date() && session.endDate >= new Date(),
    },
  };
}
}