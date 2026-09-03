import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

async createClass(dto: CreateClassDto) {
  // FIX: Check for duplicate class name
  const existingClass = await this.prisma.class.findFirst({
    where: { name: dto.name },
  });
  
  if (existingClass) {
    throw new ConflictException(`Class with name "${dto.name}" already exists`);
  }
  
  // FIX: Validate academic session if provided
  if (dto.academicSessionId) {
    const sessionExists = await this.prisma.academicSession.findUnique({
      where: { id: dto.academicSessionId },
    });
    if (!sessionExists) {
      throw new BadRequestException('Academic session not found');
    }
  }
  
  return this.prisma.class.create({
    data: {
      name: dto.name,
      ...(dto.academicSessionId 
        ? { academicSession: { connect: { id: dto.academicSessionId } } } 
        : {}),
    },
  });
}

  // ✅ STANDARD PAGINATED RESPONSE
  async findAll(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [count, data] = await Promise.all([
      this.prisma.class.count(),
      this.prisma.class.findMany({
        skip,
        take: pageSize,
       include: {
  academicSession: true,
  students: {
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      classId: true,
      sectionId: true,
      createdAt: true,
    },
  },
},

        orderBy: { id: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    return {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      next:
        page < totalPages
          ? `?page=${page + 1}&page_size=${pageSize}`
          : null,
      previous:
        page > 1
          ? `?page=${page - 1}&page_size=${pageSize}`
          : null,
      data,
    };
  }

  async findOne(id: number) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        academicSession: true,
        students: true,
      },
    });

    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    return cls;
  }

async update(id: number, dto: UpdateClassDto) {
  
    if (dto.name) {
    const existing = await this.prisma.class.findFirst({
      where: { name: dto.name, id: { not: id } },
    });
    if (existing) {
      throw new ConflictException(`Class name "${dto.name}" already exists`);
    }
  }
  await this.findOne(id);
  
  const data: any = {};
  
  if (dto.name !== undefined) {
    // FIX: Check for duplicate name
    const existingClass = await this.prisma.class.findFirst({
      where: { name: dto.name, id: { not: id } },
    });
    if (existingClass) {
      throw new ConflictException(`Class with name "${dto.name}" already exists`);
    }
    data.name = dto.name;
  }
  
  if (dto.academicSessionId !== undefined) {
    if (dto.academicSessionId !== null) {
      const sessionExists = await this.prisma.academicSession.findUnique({
        where: { id: dto.academicSessionId },
      });
      if (!sessionExists) {
        throw new BadRequestException('Academic session not found');
      }
    }
    data.academicSession = dto.academicSessionId === null
      ? { disconnect: true }
      : { connect: { id: dto.academicSessionId } };
  }
  
  return this.prisma.class.update({ where: { id }, data });
}
async remove(id: number) {
  // First check if class exists
  await this.findOne(id);

  // Check for active students before deletion
  const activeStudents = await this.prisma.student.count({
    where: {
      classId: id,
      status: { in: ['ACTIVE', 'ADMITTED'] },
    },
  });

  if (activeStudents > 0) {
    throw new BadRequestException(
      `Cannot delete class with ${activeStudents} active students. Transfer students first.`
    );
  }

  return this.prisma.$transaction(async (tx) => {
    // 1. Delete Attendance records for students in this class
    await tx.attendance.deleteMany({
      where: { classId: id },
    });

    // 2. Get all exam IDs for this class
    const exams = await tx.exam.findMany({
      where: { classId: id },
      select: { id: true },
    });

    const examIds = exams.map((e) => e.id);

    if (examIds.length > 0) {
      // 3. Delete Grade records (FIX: was missing)
      await tx.grade.deleteMany({
        where: { examId: { in: examIds } },
      });

      // 4. Delete ExamResults linked to those exams
      await tx.examResult.deleteMany({
        where: { examId: { in: examIds } },
      });

      // 5. Delete ExamSubjects linked to those exams
      await tx.examSubject.deleteMany({
        where: { examId: { in: examIds } },
      });

      // 6. Delete Exams
      await tx.exam.deleteMany({
        where: { classId: id },
      });
    }

    // 7. Delete Class Timetables linked through sections
    await tx.classTimetable.deleteMany({
      where: {
        section: {
          classId: id,
        },
      },
    });

    // 8. Delete Section Subjects linked through sections
    await tx.sectionSubject.deleteMany({
      where: {
        section: {
          classId: id,
        },
      },
    });

    // 9. Delete Report Cards linked to this class
    await tx.reportCard.deleteMany({
      where: { classId: id },
    });

    // 10. Update students to remove class reference (soft)
    await tx.student.updateMany({
      where: { classId: id },
      data: { classId: null, sectionId: null },
    });

    // 11. Delete Sections belonging to this class
    await tx.section.deleteMany({
      where: { classId: id },
    });

    // 12. Finally, delete the Class itself
    return tx.class.delete({
      where: { id },
    });
  });
}

async getClassCapacityUsage(classId: number) {
  const classData = await this.prisma.class.findUnique({
    where: { id: classId },
    include: {
      Section: {
        include: { 
          students: { 
            where: { status: { in: ['ACTIVE', 'ADMITTED'] } } 
          } 
        }
      },
      students: { 
        where: { status: { in: ['ACTIVE', 'ADMITTED'] } } 
      }
    }
  });

  if (!classData) throw new NotFoundException('Class not found');

  let totalCapacity = 0;
  let totalEnrolled = 0;
  const sections = [];

  for (const section of classData.Section) {
    const cap = section.capacity || 0;
    const enrolled = section.students.length;
    totalCapacity += cap;
    totalEnrolled += enrolled;
    sections.push({
      sectionId: section.id,
      name: section.name,
      capacity: cap,
      enrolled,
      available: cap - enrolled,
      // FIX: Round to 2 decimal places
      percentage: cap > 0 ? Math.round((enrolled / cap) * 10000) / 100 : 0
    });
  }

  const directStudents = classData.students.filter(s => !s.sectionId);
  totalEnrolled += directStudents.length;

  // FIX: Add warning if capacity is zero
  const usagePercentage = totalCapacity > 0 
    ? Math.round((totalEnrolled / totalCapacity) * 10000) / 100 
    : 0;

  return {
    classId: classData.id,
    className: classData.name,
    totalCapacity,
    totalEnrolled,
    available: totalCapacity - totalEnrolled,
    usagePercentage,
    // FIX: Add warning flags
    isOverCapacity: totalEnrolled > totalCapacity && totalCapacity > 0,
    hasNoCapacityConfigured: totalCapacity === 0,
    sections
  };
}
}
