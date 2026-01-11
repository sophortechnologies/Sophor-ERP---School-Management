import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private readonly prisma: PrismaService) {}

  // normalize date to 00:00:00
  private normalizeDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async create(dto: CreateHolidayDto) {
    const date = this.normalizeDate(new Date(dto.date));

    return this.prisma.holiday.create({
      data: {
        name: dto.name,
        date,
        type: dto.type,
        isHalfDay: dto.isHalfDay ?? false,
        academicSessionId: dto.academicSessionId,
      },
    });
  }

  async findAllPaginated(
    page = 1,
    pageSize = 10,
    academicSessionId?: number,
  ) {
    const skip = (page - 1) * pageSize;

    const where = academicSessionId
      ? { academicSessionId }
      : {};

    const [count, holidays] = await Promise.all([
      this.prisma.holiday.count({ where }),
      this.prisma.holiday.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    return {
      count,
      total_pages: totalPages,
      current_page: page,
      next:
        page < totalPages
          ? `http://localhost:5000/holidays?page=${page + 1}&page_size=${pageSize}`
          : null,
      previous:
        page > 1
          ? `http://localhost:5000/holidays?page=${page - 1}&page_size=${pageSize}`
          : null,
      page_size: pageSize,
      data: holidays,
    };
  }

  async update(id: number, dto: UpdateHolidayDto) {
    return this.prisma.holiday.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date
          ? this.normalizeDate(new Date(dto.date))
          : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  // 🔑 used by AttendanceService
  async isHoliday(date: Date, academicSessionId?: number) {
    const normalizedDate = this.normalizeDate(date);

    const holiday = await this.prisma.holiday.findFirst({
      where: {
        date: normalizedDate,
        academicSessionId,
      },
    });

    return {
      isHoliday: !!holiday,
      isHalfDay: holiday?.isHalfDay ?? false,
    };
  }
}
