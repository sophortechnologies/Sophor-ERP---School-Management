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
    const overlappingSession = await this.prisma.academicSession.findFirst({
      where: {
        OR: [
          {
            startDate: { lte: new Date(createAcademicSessionDto.endDate) },
            endDate: { gte: new Date(createAcademicSessionDto.startDate) },
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
        startDate: new Date(createAcademicSessionDto.startDate),
        endDate: new Date(createAcademicSessionDto.endDate),
      },
    });
  }

  async findAll() {
    return this.prisma.academicSession.findMany({
      orderBy: { startDate: 'desc' },
    });
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
      where: { } as any,
    });

   
    return this.prisma.academicSession.delete({
      where: { id: numericId },
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
    
    const [session, studentCount, classCount] = await Promise.all([
      this.prisma.academicSession.findUnique({
        where: { id: numericId },
      }),
      this.prisma.student.count({
        where: { 
          // Update this based on your actual Student model
        } as any,
      }),
      this.prisma.class.count({
        where: { 
          // Update this based on your actual Class model  
        } as any,
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
      },
    };
  }
}