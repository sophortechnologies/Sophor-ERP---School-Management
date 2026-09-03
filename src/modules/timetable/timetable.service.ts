import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { DayOfWeek } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================
  // CREATE TIMETABLE SLOT
  // =====================================
  async create(dto: CreateTimetableDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.validateRelations(
        dto.sectionId,
        dto.subjectId,
        dto.teacherId,
      );

      const startTime = new Date(dto.startTime);
      const endTime = new Date(dto.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      await this.checkTeacherWorkload(
        dto.teacherId,
        dto.dayOfWeek,
        startTime,
        endTime,
      );

      await this.checkConflicts(
        dto.sectionId,
        dto.teacherId,
        dto.dayOfWeek,
        startTime,
        endTime,
      );

      const timetable = await tx.classTimetable.create({
        data: {
          sectionId: dto.sectionId,
          subjectId: dto.subjectId,
          teacherId: dto.teacherId,
          dayOfWeek: dto.dayOfWeek,
          startTime,
          endTime,
        },
      });

      // FR7.9: Send notification for schedule change
      await this.notifyScheduleChange(timetable.id, 'CREATED');

      return timetable;
    });
  }

  // =====================================
  // FR7.4: AUTO-GENERATE TIMETABLE (Simplified)
  // =====================================
  async autoGenerateTimetable(classId: number, academicSessionId: number) {
    // Get all sections in the class
    const sections = await this.prisma.section.findMany({
      where: { classId },
    });

    if (sections.length === 0) {
      throw new BadRequestException(`No sections found for class ${classId}`);
    }

    // Get all subjects for this class via ClassSubject relation
    const classSubjects = await this.prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    if (classSubjects.length === 0) {
      throw new BadRequestException(`No subjects assigned to class ${classId}`);
    }

    const subjects = classSubjects.map(cs => cs.subject);

    // Get all teacher assignments
    const teacherAssignments = await this.prisma.teacherAssignment.findMany({
      include: { subject: true },
    });

    const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const periods = [8, 9, 10, 11, 13, 14, 15]; // Skip 12 (lunch)

    const results = [];
    let totalCreated = 0;

    // Delete existing timetables for these sections
    for (const section of sections) {
      await this.prisma.classTimetable.deleteMany({
        where: { sectionId: section.id },
      });
    }

    for (const section of sections) {
      for (const day of days) {
        const teacherUsage: Record<number, number> = {};
        
        for (const period of periods) {
          // Find available subject and teacher
          let assigned = false;
          
          for (const subject of subjects) {
            const availableTeachers = teacherAssignments.filter(
              a => a.subjectId === subject.id
            );
            
            for (const teacher of availableTeachers) {
              const currentHours = teacherUsage[teacher.teacherId] || 0;
              if (currentHours < 6) {
                const startTime = new Date();
                startTime.setHours(period, 0, 0, 0);
                const endTime = new Date();
                endTime.setHours(period + 1, 0, 0, 0);

                const timetable = await this.prisma.classTimetable.create({
                  data: {
                    sectionId: section.id,
                    subjectId: subject.id,
                    teacherId: teacher.teacherId,
                    dayOfWeek: day,
                    startTime,
                    endTime,
                  },
                });
                
                results.push(timetable);
                totalCreated++;
                teacherUsage[teacher.teacherId] = (teacherUsage[teacher.teacherId] || 0) + 1;
                assigned = true;
                break;
              }
            }
            if (assigned) break;
          }
        }
      }
    }

    // FR7.8: Archive the generated timetable
    await this.archiveTimetableData(classId, academicSessionId, results);

    return {
      message: 'Timetable generated successfully',
      classId,
      sections: sections.length,
      totalCreated,
    };
  }

  // =====================================
  // FR7.6: EXPORT TO EXCEL
  // =====================================
  async exportToExcel(sectionId: number): Promise<Buffer> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const timetables = await this.prisma.classTimetable.findMany({
      where: { sectionId },
      include: { subject: true },
    });

    const teacherIds = [...new Set(timetables.map(t => t.teacherId))];
    const teachers = await this.prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Timetable - ${section.class.name} ${section.name}`);

    const days: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    const headerRow = worksheet.addRow(['Time', ...days]);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F4F4F' } };
    headerRow.font = { color: { argb: 'FFFFFFFF' } };
    
    for (let hour = 8; hour <= 16; hour++) {
      if (hour === 12) continue;
      
      const row = [`${hour}:00 - ${hour + 1}:00`];
      
      for (const day of days) {
        const slot = timetables.find(
          t => t.dayOfWeek === day && t.startTime.getHours() === hour
        );
        
        if (slot) {
          const teacher = teacherMap.get(slot.teacherId);
          row.push(`${slot.subject.name}\n${teacher?.firstName || ''} ${teacher?.lastName || ''}`);
        } else {
          row.push('FREE');
        }
      }
      
      const addedRow = worksheet.addRow(row);
      
      for (let i = 1; i <= days.length; i++) {
        const cell = addedRow.getCell(i + 1);
        if (cell.value === 'FREE') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
        }
      }
    }
    
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        maxLength = Math.max(maxLength, cell.value?.toString().length || 0);
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // =====================================
  // FR7.8: ARCHIVE TIMETABLE
  // =====================================
  private async archiveTimetableData(classId: number, academicSessionId: number, timetables: any[]) {
    const sections = await this.prisma.section.findMany({
      where: { classId },
    });

    for (const section of sections) {
      const sectionTimetables = timetables.filter(t => t.sectionId === section.id);
      
      if (sectionTimetables.length > 0) {
        const archiveData = {
          sectionId: section.id,
          sectionName: section.name,
          timetables: sectionTimetables,
          archivedAt: new Date(),
        };

        await this.prisma.timetableArchive.create({
          data: {
            sectionId: section.id,
            academicSessionId,
            timetableData: archiveData,
          },
        });
      }
    }
  }

  async archiveCurrentTimetable(classId: number, academicSessionId: number) {
    const sections = await this.prisma.section.findMany({
      where: { classId },
    });

    let archivedCount = 0;

    for (const section of sections) {
      const timetables = await this.prisma.classTimetable.findMany({
        where: { sectionId: section.id },
        include: { subject: true },
      });

      if (timetables.length > 0) {
        const archiveData = {
          sectionId: section.id,
          sectionName: section.name,
          timetables: timetables.map(t => ({
            ...t,
            subjectName: t.subject.name,
          })),
          archivedAt: new Date(),
        };

        await this.prisma.timetableArchive.create({
          data: {
            sectionId: section.id,
            academicSessionId,
            timetableData: archiveData,
          },
        });
        
        archivedCount++;
      }
    }

    return { message: 'Timetable archived successfully', archivedSections: archivedCount };
  }

  async getHistoricalTimetable(sectionId: number, academicSessionId: number) {
    const archive = await this.prisma.timetableArchive.findFirst({
      where: {
        sectionId,
        academicSessionId,
      },
      orderBy: { archivedAt: 'desc' },
    });

    if (!archive) {
      throw new NotFoundException('No archived timetable found for this period');
    }

    return archive.timetableData;
  }

  // =====================================
  // FR7.9: NOTIFICATIONS FOR SCHEDULE CHANGES
  // =====================================
  private async notifyScheduleChange(timetableId: number, action: string) {
    const timetable = await this.prisma.classTimetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable) return;

    const students = await this.prisma.student.findMany({
      where: { sectionId: timetable.sectionId },
      select: { userId: true },
    });

    const subject = await this.prisma.subject.findUnique({
      where: { id: timetable.subjectId },
      select: { name: true },
    });

    const message = action === 'CREATED' 
      ? `New ${subject?.name || 'class'} scheduled on ${timetable.dayOfWeek}`
      : `Schedule changed for ${subject?.name || 'class'}`;

    for (const student of students) {
      await this.prisma.notification.create({
        data: {
          userId: student.userId,
          title: `Timetable ${action === 'CREATED' ? 'Update' : 'Change'}`,
          message,
          type: 'SCHEDULE',
        },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId: timetable.teacherId,
        title: `Timetable ${action === 'CREATED' ? 'Update' : 'Change'}`,
        message: `Your ${subject?.name || 'class'} schedule has been ${action === 'CREATED' ? 'added' : 'updated'}.`,
        type: 'SCHEDULE',
      },
    });
  }

  // =====================================
  // UPDATE TIMETABLE (with notification)
  // =====================================
  async update(id: number, dto: UpdateTimetableDto) {
    const record = await this.prisma.classTimetable.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Timetable entry not found');
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : record.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : record.endTime;

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    await this.validateRelations(
      dto.sectionId ?? record.sectionId,
      dto.subjectId ?? record.subjectId,
      dto.teacherId ?? record.teacherId,
    );

    await this.checkConflicts(
      dto.sectionId ?? record.sectionId,
      dto.teacherId ?? record.teacherId,
      dto.dayOfWeek ?? record.dayOfWeek,
      startTime,
      endTime,
      id,
    );

    const updated = await this.prisma.classTimetable.update({
      where: { id },
      data: {
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        startTime,
        endTime,
      },
    });

    await this.notifyScheduleChange(id, 'UPDATED');

    return updated;
  }

  // =====================================
  // DELETE
  // =====================================
  async remove(id: number) {
    const record = await this.prisma.classTimetable.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Timetable entry not found');
    }

    await this.notifyScheduleChange(id, 'DELETED');

    return this.prisma.classTimetable.delete({
      where: { id },
    });
  }

  // =====================================
  // WORKLOAD CHECK
  // =====================================
  private async checkTeacherWorkload(
    teacherId: number,
    dayOfWeek: DayOfWeek,
    startTime: Date,
    endTime: Date,
    excludeId?: number,
  ) {
    const teacherClasses = await this.prisma.classTimetable.findMany({
      where: {
        teacherId,
        dayOfWeek,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    const MAX_HOURS_PER_DAY = 6;
    let totalHours = 0;

    for (const cls of teacherClasses) {
      const duration = (cls.endTime.getTime() - cls.startTime.getTime()) / (1000 * 60 * 60);
      totalHours += duration;
    }

    const newDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (totalHours + newDuration > MAX_HOURS_PER_DAY) {
      throw new BadRequestException(
        `Teacher already has ${totalHours} hours of classes today. Maximum ${MAX_HOURS_PER_DAY} hours allowed.`,
      );
    }
  }

  // =====================================
  // CONFLICT CHECK
  // =====================================
  private async checkConflicts(
    sectionId: number,
    teacherId: number,
    dayOfWeek: DayOfWeek,
    startTime: Date,
    endTime: Date,
    excludeId?: number,
  ) {
    const overlapCondition = {
      dayOfWeek,
      NOT: {
        OR: [
          { endTime: { lte: startTime } },
          { startTime: { gte: endTime } },
        ],
      },
    };

    const [sectionConflict, teacherConflict] = await Promise.all([
      this.prisma.classTimetable.findFirst({
        where: {
          ...overlapCondition,
          sectionId,
          ...(excludeId && { id: { not: excludeId } }),
        },
      }),
      this.prisma.classTimetable.findFirst({
        where: {
          ...overlapCondition,
          teacherId,
          ...(excludeId && { id: { not: excludeId } }),
        },
      }),
    ]);

    if (sectionConflict) {
      throw new BadRequestException('Section already has a class during this time');
    }

    if (teacherConflict) {
      throw new BadRequestException('Teacher is already assigned during this time');
    }
  }

  // =====================================
  // VALIDATION
  // =====================================
  private async validateRelations(
    sectionId: number,
    subjectId: number,
    teacherId: number,
  ) {
    const [section, subject, teacher, teacherSubject] = await Promise.all([
      this.prisma.section.findUnique({ where: { id: sectionId } }),
      this.prisma.subject.findUnique({ where: { id: subjectId } }),
      this.prisma.user.findUnique({ where: { id: teacherId } }),
      this.prisma.teacherAssignment.findFirst({
        where: { teacherId, subjectId },
      }),
    ]);

    if (!section) throw new BadRequestException(`Section not found`);
    if (!subject) throw new BadRequestException(`Subject not found`);
    if (!teacher) throw new BadRequestException(`Teacher not found`);
    if (!teacherSubject) throw new BadRequestException(`Teacher is not assigned to teach this subject`);
  }

  // =====================================
  // QUERY METHODS
  // =====================================
  async findOne(id: number) {
    const timetable = await this.prisma.classTimetable.findUnique({
      where: { id },
      include: { subject: true },
    });
    if (!timetable) throw new NotFoundException('Timetable slot not found');
    
    const teacher = await this.prisma.user.findUnique({
      where: { id: timetable.teacherId },
      select: { id: true, firstName: true, lastName: true },
    });
    
    return { ...timetable, teacher };
  }

  async findAll(page = 1, pageSize = 10, baseUrl?: string) {
    const skip = (page - 1) * pageSize;
    const take = Math.min(pageSize, 50);
    const [count, data] = await Promise.all([
      this.prisma.classTimetable.count(),
      this.prisma.classTimetable.findMany({
        skip,
        take,
        include: { subject: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
    ]);
    
    const teacherIds = [...new Set(data.map(t => t.teacherId))];
    const teachers = await this.prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    
    const enrichedData = data.map(t => ({ ...t, teacher: teacherMap.get(t.teacherId) }));
    
    const totalPages = Math.ceil(count / take);
    const response: any = { count, total_pages: totalPages, current_page: page, page_size: take, data: enrichedData };
    if (baseUrl && totalPages > 0) {
      if (page < totalPages) response.next = `${baseUrl}?page=${page + 1}&page_size=${take}`;
      if (page > 1) response.previous = `${baseUrl}?page=${page - 1}&page_size=${take}`;
    }
    return response;
  }

  async findBySection(sectionId: number) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException('Section not found');
    
    const timetables = await this.prisma.classTimetable.findMany({
      where: { sectionId },
      include: { subject: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    
    const teacherIds = [...new Set(timetables.map(t => t.teacherId))];
    const teachers = await this.prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    
    return timetables.map(t => ({ ...t, teacher: teacherMap.get(t.teacherId) }));
  }

  async findByTeacher(teacherId: number) {
    return this.prisma.classTimetable.findMany({
      where: { teacherId },
      include: { subject: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getStudentByUserId(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, sectionId: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async getTeacherByUserId(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }
}