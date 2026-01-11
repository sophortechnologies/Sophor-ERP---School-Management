import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSectionSubjectDto } from './dto/create-section-subject.dto';
import { UpdateSectionSubjectDto } from './dto/update-section-subject.dto';

@Injectable()
export class SectionSubjectService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: assign subject + teacher to section
  async create(dto: CreateSectionSubjectDto) {
    const exists = await this.prisma.sectionSubject.findFirst({
      where: {
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'This subject is already assigned to the section',
      );
    }

    return this.prisma.sectionSubject.create({
      data: {
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
      },
    });
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
