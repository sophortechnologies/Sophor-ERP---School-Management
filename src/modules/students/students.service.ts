
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // Basic admission - using unchecked to bypass relation requirements
  async createStudentAdmission(createStudentDto: CreateStudentDto, userId: string) {
    // Generate unique student ID and admission number
    const studentId = await this.generateStudentId();
    const admissionNumber = await this.generateAdmissionNumber();

    // Create student data using unchecked (bypasses relation validation)
    const studentData = {
      // Required identification fields
      studentId,
      admissionNumber,
      
      // Personal information
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      dateOfBirth: createStudentDto.dateOfBirth,
      gender: createStudentDto.gender,
      
      // Guardian information
      guardianName: createStudentDto.guardianName,
      guardianRelation: createStudentDto.guardianRelation,
      guardianPhone: createStudentDto.guardianPhone,
      
      // Contact information
      email: createStudentDto.email,
      phone: createStudentDto.phone,
      address: createStudentDto.address,
      
      // System fields
      admissionDate: new Date(),
      isActive: true,
    };

    // Use createUnchecked to bypass relation requirements temporarily
    return (this.prisma.student as any).createUnchecked({
      data: studentData,
    });
  }

  // Keep all other methods the same as above...
  async findAll() {
    return this.prisma.student.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);
    
    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    return this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `STU${year}`;
    
    const lastStudent = await this.prisma.student.findFirst({
      where: { studentId: { startsWith: prefix } },
      orderBy: { studentId: 'desc' },
    });

    let sequence = 1;
    if (lastStudent && lastStudent.studentId) {
      const lastSequence = parseInt(lastStudent.studentId.slice(-4), 10) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private async generateAdmissionNumber(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `ADM${year}`;
    
    const lastStudent = await this.prisma.student.findFirst({
      where: { admissionNumber: { startsWith: prefix } },
      orderBy: { admissionNumber: 'desc' },
    });

    let sequence = 1;
    if (lastStudent && lastStudent.admissionNumber) {
      const lastSequence = parseInt(lastStudent.admissionNumber.slice(-4), 10) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
}