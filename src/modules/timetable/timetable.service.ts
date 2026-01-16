import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { DayOfWeek } from '@prisma/client';

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
        throw new BadRequestException(
          'Start time must be before end time',
        );
      }

      await this.checkConflicts(
        dto.sectionId,
        dto.teacherId,
        dto.dayOfWeek,
        startTime,
        endTime,
      );

      return tx.classTimetable.create({
        data: {
          sectionId: dto.sectionId,
          subjectId: dto.subjectId,
          teacherId: dto.teacherId,
          dayOfWeek: dto.dayOfWeek,
          startTime,
          endTime,
        },
      });
    });
  }

async findOne(id: number) {
  const timetable = await this.prisma.classTimetable.findUnique({
    where: { id },
    include: {
      section: {
        select: {
          id: true,
          name: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!timetable) {
    throw new NotFoundException('Timetable slot not found');
  }

  return timetable;
}

  // =====================================
  // GET ALL
  // =====================================
  async findAll() {
    return this.prisma.classTimetable.findMany({
      include: {
        section: true,
        subject: true,
        teacher: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  // =====================================
  // GET BY SECTION
  // =====================================
  async findBySection(sectionId: number) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.classTimetable.findMany({
      where: { sectionId },
      include: {
        subject: true,
        teacher: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  // =====================================
  // GET BY TEACHER
  // =====================================
  async findByTeacher(teacherId: number) {
    return this.prisma.classTimetable.findMany({
      where: { teacherId },
      include: {
        section: true,
        subject: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  // =====================================
  // UPDATE TIMETABLE SLOT
  // =====================================
  async update(id: number, dto: UpdateTimetableDto) {
    const record = await this.prisma.classTimetable.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Timetable entry not found');
    }

    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : record.startTime;

    const endTime = dto.endTime
      ? new Date(dto.endTime)
      : record.endTime;

    if (startTime >= endTime) {
      throw new BadRequestException(
        'Start time must be before end time',
      );
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

    return this.prisma.classTimetable.update({
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

    return this.prisma.classTimetable.delete({
      where: { id },
    });
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
      throw new BadRequestException(
        'Section already has a class during this time',
      );
    }

    if (teacherConflict) {
      throw new BadRequestException(
        'Teacher is already assigned during this time',
      );
    }
  }

  // =====================================
  // FK VALIDATION
  // =====================================
  private async validateRelations(
    sectionId: number,
    subjectId: number,
    teacherId: number,
  ) {
    const [section, subject, teacher] = await Promise.all([
      this.prisma.section.findUnique({ where: { id: sectionId } }),
      this.prisma.subject.findUnique({ where: { id: subjectId } }),
      this.prisma.user.findUnique({ where: { id: teacherId } }),
    ]);

    if (!section) {
      throw new BadRequestException('Section not found');
    }

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    if (!teacher) {
      throw new BadRequestException('Teacher not found');
    }
  }
}
