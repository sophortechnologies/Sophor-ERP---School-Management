import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  // ================================
  // CREATE TIMETABLE SLOT
  // ================================
  async create(dto: CreateTimetableDto) {
    const {
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
    } = dto;

    // 1️⃣ Validate foreign keys
    await this.validateRelations(sectionId, subjectId, teacherId);

    // 2️⃣ Prevent time overlap in same section & day
    const conflict = await this.prisma.classTimetable.findFirst({
      where: {
        sectionId,
        dayOfWeek,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'Timetable slot overlaps with an existing entry',
      );
    }

    // 3️⃣ Create timetable
    return this.prisma.classTimetable.create({
      data: {
        section: { connect: { id: sectionId } },
        subject: { connect: { id: subjectId } },
        teacher: { connect: { id: teacherId } },
        dayOfWeek,
        startTime,
        endTime,
      },
    });
  }

  // ================================
  // GET ALL TIMETABLES
  // ================================
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

  // ================================
  // GET BY SECTION
  // ================================
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

  // ================================
  // UPDATE TIMETABLE
  // ================================
  async update(id: number, dto: UpdateTimetableDto) {
    const record = await this.prisma.classTimetable.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Timetable entry not found');
    }

    // If foreign keys are updated → validate again
    if (dto.sectionId || dto.subjectId || dto.teacherId) {
      await this.validateRelations(
        dto.sectionId ?? record.sectionId,
        dto.subjectId ?? record.subjectId,
        dto.teacherId ?? record.teacherId,
      );
    }

    return this.prisma.classTimetable.update({
  where: { id },
  data: {
    dayOfWeek: dto.dayOfWeek,
    startTime: dto.startTime,
    endTime: dto.endTime,

    ...(dto.sectionId && {
      section: { connect: { id: dto.sectionId } },
    }),
    ...(dto.subjectId && {
      subject: { connect: { id: dto.subjectId } },
    }),
    ...(dto.teacherId && {
      teacher: { connect: { id: dto.teacherId } },
    }),
  },
});
  }

  // ================================
  // DELETE TIMETABLE
  // ================================
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

  // ================================
  // HELPER: VALIDATE FK RELATIONS
  // ================================
  private async validateRelations(
    sectionId: number,
    subjectId: number,
    teacherId: number,
  ) {
    const [section, subject, teacher] = await Promise.all([
      this.prisma.section.findUnique({ where: { id: sectionId } }),
      this.prisma.subject.findUnique({ where: { id: subjectId } }),
      this.prisma.teacher.findUnique({ where: { id: teacherId } }),
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
