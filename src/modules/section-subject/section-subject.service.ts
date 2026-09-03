import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSectionSubjectDto } from './dto/create-section-subject.dto';
import { UpdateSectionSubjectDto } from './dto/update-section-subject.dto';

@Injectable()
export class SectionSubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionSubjectDto) {
  // 1. Validate section exists
  const section = await this.prisma.section.findUnique({
    where: { id: dto.sectionId },
    include: {
      class: {
        select: { id: true, name: true },
      },
    },
  });

  if (!section) {
    throw new NotFoundException(`Section with ID ${dto.sectionId} not found`);
  }

  // 2. Validate subject exists
  const subject = await this.prisma.subject.findUnique({
    where: { id: dto.subjectId },
  });

  if (!subject) {
    throw new NotFoundException(`Subject with ID ${dto.subjectId} not found`);
  }

  // 3. ISSUE 8 FIX: Check if subject is active
  if (!subject.isActive) {
    throw new BadRequestException(
      `Cannot assign inactive subject "${subject.name}" to section. Please activate the subject first.`
    );
  }

  // 4. Validate teacher exists
  const teacher = await this.prisma.teacher.findUnique({
    where: { userId: dto.teacherId },
  });

  if (!teacher) {
    throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
  }

  // 5. Check teacher status
  if (teacher.status !== 'active') {
    throw new BadRequestException(`Teacher is not active`);
  }

  // 6. Check teacher specialization matches subject
  if (teacher.specialization) {
    const teacherSpecialization = teacher.specialization.toLowerCase();
    const subjectName = subject.name.toLowerCase();
    const subjectCode = subject.code.toLowerCase();

    if (teacherSpecialization !== subjectName && teacherSpecialization !== subjectCode) {
      throw new BadRequestException(
        `Teacher specialization (${teacher.specialization}) does not match subject (${subject.name})`
      );
    }
  }

  // 7. Check for duplicate assignment
  const existingAssignment = await this.prisma.sectionSubject.findFirst({
    where: {
      sectionId: dto.sectionId,
      subjectId: dto.subjectId,
    },
  });

  if (existingAssignment) {
    throw new ConflictException(
      `Subject "${subject.name}" is already assigned to section "${section.name}"`
    );
  }

  // 8. Check teacher availability (timetable conflicts)
  const teacherSections = await this.prisma.sectionSubject.findMany({
    where: { teacherId: dto.teacherId },
    select: { sectionId: true },
  });

  const teacherSectionIds = teacherSections.map(ts => ts.sectionId);

  if (teacherSectionIds.length > 0) {
    const conflictingTimetables = await this.prisma.classTimetable.findMany({
      where: {
        teacherId: dto.teacherId,
        sectionId: { in: teacherSectionIds },
      },
      include: {
        section: {
          select: { name: true, class: { select: { name: true } } },
        },
      },
    });

    if (conflictingTimetables.length > 0) {
      const conflicts = conflictingTimetables.map(ct => 
        `${ct.section.class.name} - ${ct.section.name} (${ct.dayOfWeek}, ${ct.startTime})`
      );
      
      throw new BadRequestException(
        `Teacher already has timetable conflicts in: ${conflicts.join(', ')}`
      );
    }
  }

  // 9. Check teacher max sections limit
  const teacherAssignments = await this.prisma.sectionSubject.count({
    where: { teacherId: dto.teacherId },
  });

  const MAX_SECTIONS_PER_TEACHER = 8;
  if (teacherAssignments >= MAX_SECTIONS_PER_TEACHER) {
    throw new BadRequestException(
      `Teacher already assigned to ${teacherAssignments} sections (max ${MAX_SECTIONS_PER_TEACHER})`
    );
  }

  // 10. Create the assignment
  const assignment = await this.prisma.sectionSubject.create({
    data: {
      sectionId: dto.sectionId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
    },
    include: {
      section: {
        select: { id: true, name: true, class: { select: { id: true, name: true } } },
      },
      subject: {
        select: { id: true, name: true, code: true, isActive: true },
      },
    },
  });

  return {
    message: 'Subject assigned to section successfully',
    data: assignment,
  };
}

  // GET ALL
  async findAll() {
    return this.prisma.sectionSubject.findMany({
      include: {
        section: true,
        subject: true,
        teacher: true,
      },
    });
  }

  // GET BY SECTION
  async findBySection(sectionId: number) {
    return this.prisma.sectionSubject.findMany({
      where: { sectionId },
      include: {
        subject: true,
        teacher: true,
      },
    });
  }

  // UPDATE (teacher reassignment)
  async update(id: number, dto: UpdateSectionSubjectDto) {
    const record = await this.prisma.sectionSubject.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.sectionSubject.update({
      where: { id },
      data: {
        teacherId: dto.teacherId,
      },
    });
  }

  // DELETE
  async remove(id: number) {
    const record = await this.prisma.sectionSubject.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.sectionSubject.delete({
      where: { id },
    });
  }
}
