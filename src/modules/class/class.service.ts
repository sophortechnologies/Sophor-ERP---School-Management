import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async createClass(dto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        name: dto.name,
        ...(dto.academicSessionId
          ? {
              academicSession: {
                connect: { id: dto.academicSessionId },
              },
            }
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
    await this.findOne(id);

    const data: any = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.academicSessionId !== undefined) {
      data.academicSession =
        dto.academicSessionId === null
          ? { disconnect: true }
          : { connect: { id: dto.academicSessionId } };
    }

    return this.prisma.class.update({
      where: { id },
      data,
    });
  }

async remove(id: number) {
  // First check if class exists
  await this.findOne(id);

  return this.prisma.$transaction(async (tx) => {
    // 1. Delete Attendance records for students in this class
    await tx.attendance.deleteMany({
      where: { classId: id },
    });

    // 2. Delete Exams directly linked to this class
    await tx.exam.deleteMany({
      where: { classId: id },
    });

    // 3. Delete ExamResults linked to those exams (if any)
    // (Optional but recommended to avoid orphaned results)
    const examIds = await tx.exam.findMany({
      where: { classId: id },
      select: { id: true },
    });

    if (examIds.length > 0) {
      await tx.examResult.deleteMany({
        where: {
          examId: { in: examIds.map((e) => e.id) },
        },
      });
    }

    // 4. Delete Class Timetables linked through sections
    await tx.classTimetable.deleteMany({
      where: {
        section: {
          classId: id,
        },
      },
    });

    // 5. Delete Section Subjects linked through sections
    await tx.sectionSubject.deleteMany({
      where: {
        section: {
          classId: id,
        },
      },
    });

    // 6. Delete Sections belonging to this class
    await tx.section.deleteMany({
      where: { classId: id },
    });

    // 7. Finally, delete the Class itself
    return tx.class.delete({
      where: { id },
    });
  });
}
}
