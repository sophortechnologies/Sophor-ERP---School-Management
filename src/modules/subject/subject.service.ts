import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  /** -------------------- CREATE SUBJECT -------------------- **/
  async create(dto: CreateSubjectDto, userId: number) {
  // Check duplicate code
  const exists = await this.prisma.subject.findUnique({
    where: { code: dto.code },
  });

  if (exists) {
    throw new ConflictException(
      `A subject already exists with code "${dto.code}"`,
    );
  }

 return this.prisma.subject.create({
  data: {
    name: dto.name,
    code: dto.code,
    // type: dto.type,
    description: dto.description ?? null,
    departmentId: dto.departmentId ?? null,
    isActive: dto.isActive ?? true,
    createdBy: userId,
  },
});

}

  /** -------------------- GET ALL SUBJECTS -------------------- **/
  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /** -------------------- GET SUBJECT BY ID -------------------- **/
  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  /** -------------------- UPDATE SUBJECT -------------------- **/
  async update(id: number, dto: UpdateSubjectDto, userId: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // If code is being updated, ensure it's unique
    if (dto.code && dto.code !== subject.code) {
      const existingCode = await this.prisma.subject.findUnique({
        where: { code: dto.code },
      });

      if (existingCode) {
        throw new ConflictException(
          `Another subject already uses code "${dto.code}"`,
        );
      }
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name ?? subject.name,
        code: dto.code ?? subject.code,
        description: dto.description ?? subject.description,
        // updatedBy: userId, // Only works if schema has updatedBy
      },
    });
  }

  /** -------------------- DELETE SUBJECT -------------------- **/
  async remove(id: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    await this.prisma.subject.delete({ where: { id } });

    return { message: 'Subject deleted successfully' };
  }
}
