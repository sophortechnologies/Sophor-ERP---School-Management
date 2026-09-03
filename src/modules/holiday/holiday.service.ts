import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async create(dto: CreateHolidayDto) {
    const date = this.normalizeDate(new Date(dto.date));
    const today = this.normalizeDate(new Date());

    if (date < today) {
      throw new BadRequestException('Cannot create holiday in the past');
    }

    const existingHoliday = await this.prisma.holiday.findFirst({
      where: {
        date,
        academicSessionId: dto.academicSessionId ?? null,
      },
    });

    if (existingHoliday) {
      throw new ConflictException('Holiday already exists on this date for this academic session');
    }

    const holiday = await this.prisma.holiday.create({
      data: {
        name: dto.name,
        date,
        type: dto.type,
        isHalfDay: dto.isHalfDay ?? false,
        academicSessionId: dto.academicSessionId,
      },
    });

    if (!holiday.isHalfDay) {
      await this.autoMarkHolidayAttendance(date, dto.academicSessionId);
    }

    return holiday;
  }

  async findAllPaginated(
    page = 1,
    pageSize = 10,
    academicSessionId?: number,
    baseUrl?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const take = Math.min(pageSize, 100);

    const where = academicSessionId ? { academicSessionId } : {};

    const [count, holidays] = await Promise.all([
      this.prisma.holiday.count({ where }),
      this.prisma.holiday.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(count / take);

    const response: any = {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: take,
      data: holidays,
    };

    if (baseUrl) {
      if (page < totalPages) {
        response.next = `${baseUrl}?page=${page + 1}&page_size=${take}`;
      }
      if (page > 1) {
        response.previous = `${baseUrl}?page=${page - 1}&page_size=${take}`;
      }
    }

    return response;
  }

  async update(id: number, dto: UpdateHolidayDto) {
    const existing = await this.prisma.holiday.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Holiday not found');
    }

    const updateData: any = { ...dto };

    if (dto.date) {
      const newDate = this.normalizeDate(new Date(dto.date));
      const today = this.normalizeDate(new Date());

      if (newDate < today) {
        throw new BadRequestException('Cannot set holiday date in the past');
      }

      const conflictingHoliday = await this.prisma.holiday.findFirst({
        where: {
          date: newDate,
          academicSessionId: dto.academicSessionId ?? existing.academicSessionId,
          id: { not: id },
        },
      });

      if (conflictingHoliday) {
        throw new ConflictException('Holiday already exists on this date');
      }

      updateData.date = newDate;
    }

    return this.prisma.holiday.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    const today = this.normalizeDate(new Date());
    if (holiday.date < today) {
      throw new BadRequestException('Cannot delete past holidays for audit purposes');
    }

    return this.prisma.holiday.delete({ where: { id } });
  }

  async isHoliday(date: Date, academicSessionId?: number) {
    const normalizedDate = this.normalizeDate(date);

    const holiday = await this.prisma.holiday.findFirst({
      where: {
        date: normalizedDate,
        academicSessionId: academicSessionId ?? null,
      },
    });

    return {
      isHoliday: !!holiday,
      isHalfDay: holiday?.isHalfDay ?? false,
      holidayName: holiday?.name ?? null,
      holidayType: holiday?.type ?? null,
      date: normalizedDate,
    };
  }

  private async autoMarkHolidayAttendance(date: Date, academicSessionId?: number) {
    const students = await this.prisma.student.findMany({
      where: academicSessionId ? { sessionId: academicSessionId } : {},
      select: { id: true, classId: true },
    });

    for (const student of students) {
      const existing = await this.prisma.attendance.findFirst({
        where: { studentId: student.id, date },
      });

      if (!existing && student.classId) {
        await this.prisma.attendance.create({
          data: {
            studentId: student.id,
            classId: student.classId,
            date,
            status: 'HOLIDAY',
          },
        });
      }
    }
  }
}