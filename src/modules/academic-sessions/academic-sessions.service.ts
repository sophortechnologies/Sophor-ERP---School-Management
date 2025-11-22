
// // // // import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
// // // // import { PrismaService } from '../../database/prisma.service';
// // // // import { CreateAcademicSessionDto, UpdateAcademicSessionDto } from './dto/create-academic-session.dto';

// // // // @Injectable()
// // // // export class AcademicSessionsService {
// // // //   constructor(private prisma: PrismaService) {}

// // // //   async create(createAcademicSessionDto: CreateAcademicSessionDto) {
// // // //     // Check if session with same name already exists
// // // //     const existingSession = await this.prisma.academicSession.findFirst({
// // // //       where: { 
// // // //         name: createAcademicSessionDto.name
// // // //       },
// // // //     });

// // // //     if (existingSession) {
// // // //       throw new ConflictException('Academic session with this name already exists');
// // // //     }

// // // //     // Validate date range
// // // //     if (createAcademicSessionDto.startDate >= createAcademicSessionDto.endDate) {
// // // //       throw new BadRequestException('Start date must be before end date');
// // // //     }

// // // //     // If setting as active, deactivate all other sessions
// // // //     if (createAcademicSessionDto.isActive) {
// // // //       await this.deactivateAllSessions();
// // // //     }

// // // //     return this.prisma.academicSession.create({
// // // //       data: createAcademicSessionDto,
// // // //     });
// // // //   }

// // // //   async findAll() {
// // // //     return this.prisma.academicSession.findMany({
// // // //       orderBy: { startDate: 'desc' },
// // // //     });
// // // //   }

// // // //   async findActive() {
// // // //     const activeSession = await this.prisma.academicSession.findFirst({
// // // //       where: { isActive: true },
// // // //     });

// // // //     if (!activeSession) {
// // // //       throw new NotFoundException('No active academic session found');
// // // //     }

// // // //     return activeSession;
// // // //   }

// // // //   async findOne(id: number) {
// // // //     const session = await this.prisma.academicSession.findUnique({
// // // //       where: { id },
// // // //     });

// // // //     if (!session) {
// // // //       throw new NotFoundException(`Academic session with ID ${id} not found`);
// // // //     }

// // // //     return session;
// // // //   }

// // // //   async update(id: number, updateAcademicSessionDto: UpdateAcademicSessionDto) {
// // // //     await this.findOne(id); // Check if exists

// // // //     // If activating this session, deactivate all others
// // // //     if (updateAcademicSessionDto.isActive) {
// // // //       await this.deactivateAllSessions();
// // // //     }

// // // //     return this.prisma.academicSession.update({
// // // //       where: { id },
// // // //       data: updateAcademicSessionDto,
// // // //     });
// // // //   }

// // // //   async activate(id: number) {
// // // //     await this.findOne(id); // Check if exists
    
// // // //     // Deactivate all other sessions first
// // // //     await this.deactivateAllSessions();

// // // //     return this.prisma.academicSession.update({
// // // //       where: { id },
// // // //       data: { isActive: true },
// // // //     });
// // // //   }

// // // //   private async deactivateAllSessions() {
// // // //     await this.prisma.academicSession.updateMany({
// // // //       data: { isActive: false },
// // // //     });
// // // //   }

// // // //   async remove(id: number) {
// // // //     await this.findOne(id); // Check if exists

// // // //     return this.prisma.academicSession.delete({
// // // //       where: { id },
// // // //     });
// // // //   }
// // // // }

// // // import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// // // import { PrismaService } from '../../database/prisma.service';
// // // import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
// // // import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

// // // @Injectable()
// // // export class AcademicSessionsService {
// // //   constructor(private prisma: PrismaService) {}

// // //   async create(createAcademicSessionDto: CreateAcademicSessionDto) {
// // //     const { isCurrent, ...sessionData } = createAcademicSessionDto;

// // //     // If setting as current, deactivate other current sessions
// // //     if (isCurrent) {
// // //       await this.prisma.academicSession.updateMany({
// // //         where: { isCurrent: true },
// // //         data: { isCurrent: false },
// // //       });
// // //     }

// // //     return this.prisma.academicSession.create({
// // //       data: {
// // //         ...sessionData,
// // //         isCurrent: isCurrent || false,
// // //       },
// // //     });
// // //   }

// // //   async findAll() {
// // //     return this.prisma.academicSession.findMany({
// // //       orderBy: {
// // //         startDate: 'desc',
// // //       },
// // //     });
// // //   }

// // //   async findCurrent() {
// // //     return this.prisma.academicSession.findFirst({
// // //       where: { isCurrent: true },
// // //     });
// // //   }

// // //   async findOne(id: string) {
// // //     const session = await this.prisma.academicSession.findUnique({
// // //       where: { id },
// // //     });

// // //     if (!session) {
// // //       throw new NotFoundException('Academic session not found');
// // //     }

// // //     return session;
// // //   }

// // //   async update(id: string, updateAcademicSessionDto: UpdateAcademicSessionDto) {
// // //     await this.findOne(id); // Check if exists

// // //     const { isCurrent, ...updateData } = updateAcademicSessionDto;

// // //     // If setting as current, deactivate other current sessions
// // //     if (isCurrent) {
// // //       await this.prisma.academicSession.updateMany({
// // //         where: { 
// // //           isCurrent: true,
// // //           id: { not: id }
// // //         },
// // //         data: { isCurrent: false },
// // //       });
// // //     }

// // //     return this.prisma.academicSession.update({
// // //       where: { id },
// // //       data: {
// // //         ...updateData,
// // //         ...(isCurrent !== undefined ? { isCurrent } : {}),
// // //       },
// // //     });
// // //   }

// // //   async remove(id: string) {
// // //     await this.findOne(id); // Check if exists

// // //     // Check if session has associated data
// // //     const hasStudents = await this.prisma.student.count({
// // //       where: {
// // //         admissionDate: {
// // //           gte: await this.getSessionStartDate(id),
// // //           lte: await this.getSessionEndDate(id),
// // //         },
// // //       },
// // //     });

// // //     if (hasStudents > 0) {
// // //       throw new ConflictException('Cannot delete academic session with associated students');
// // //     }

// // //     return this.prisma.academicSession.delete({
// // //       where: { id },
// // //     });
// // //   }

// // //   async setCurrent(id: string) {
// // //     await this.findOne(id); // Check if exists

// // //     // Deactivate other current sessions
// // //     await this.prisma.academicSession.updateMany({
// // //       where: { 
// // //         isCurrent: true,
// // //         id: { not: id }
// // //       },
// // //       data: { isCurrent: false },
// // //     });

// // //     // Set this session as current
// // //     return this.prisma.academicSession.update({
// // //       where: { id },
// // //       data: { isCurrent: true },
// // //     });
// // //   }

// // //   private async getSessionStartDate(id: string): Promise<Date> {
// // //     const session = await this.prisma.academicSession.findUnique({
// // //       where: { id },
// // //       select: { startDate: true },
// // //     });
// // //     return session?.startDate || new Date();
// // //   }

// // //   private async getSessionEndDate(id: string): Promise<Date> {
// // //     const session = await this.prisma.academicSession.findUnique({
// // //       where: { id },
// // //       select: { endDate: true },
// // //     });
// // //     return session?.endDate || new Date();
// // //   }
// // // }

// // import { Injectable, NotFoundException } from '@nestjs/common';
// // import { PrismaService } from '../../database/prisma.service';
// // import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
// // import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

// // @Injectable()
// // export class AcademicSessionsService {
// //   constructor(private prisma: PrismaService) {}

// //   async create(createAcademicSessionDto: CreateAcademicSessionDto) {
// //     const { isCurrent, ...sessionData } = createAcademicSessionDto;

// //     // If setting as current, deactivate other current sessions
// //     if (isCurrent) {
// //       await this.prisma.academicSession.updateMany({
// //         where: { isCurrent: true },
// //         data: { isCurrent: false },
// //       });
// //     }

// //     return this.prisma.academicSession.create({
// //       data: {
// //         ...sessionData,
// //         isCurrent: isCurrent || false,
// //       },
// //     });
// //   }

// //   async findAll() {
// //     return this.prisma.academicSession.findMany({
// //       orderBy: {
// //         startDate: 'desc',
// //       },
// //     });
// //   }

// //   async findCurrent() {
// //     return this.prisma.academicSession.findFirst({
// //       where: { isCurrent: true },
// //     });
// //   }

// //   async findOne(id: string) {
// //     const session = await this.prisma.academicSession.findUnique({
// //       where: { id },
// //     });

// //     if (!session) {
// //       throw new NotFoundException('Academic session not found');
// //     }

// //     return session;
// //   }

// //   async update(id: string, updateAcademicSessionDto: UpdateAcademicSessionDto) {
// //     await this.findOne(id); // Check if exists

// //     const { isCurrent, ...updateData } = updateAcademicSessionDto;

// //     // If setting as current, deactivate other current sessions
// //     if (isCurrent) {
// //       await this.prisma.academicSession.updateMany({
// //         where: { 
// //           isCurrent: true,
// //           id: { not: id }
// //         },
// //         data: { isCurrent: false },
// //       });
// //     }

// //     return this.prisma.academicSession.update({
// //       where: { id },
// //       data: {
// //         ...updateData,
// //         ...(isCurrent !== undefined ? { isCurrent } : {}),
// //       },
// //     });
// //   }

// //   async remove(id: string) {
// //     await this.findOne(id); // Check if exists
// //     return this.prisma.academicSession.delete({
// //       where: { id },
// //     });
// //   }
// // }

// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';
// import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
// import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

// @Injectable()
// export class AcademicSessionsService {
//   constructor(private prisma: PrismaService) {}

//   async create(createAcademicSessionDto: CreateAcademicSessionDto) {
//     const { isCurrent, ...sessionData } = createAcademicSessionDto;

//     // If setting as current, deactivate other current sessions
//     if (isCurrent) {
//       await this.prisma.academicSession.updateMany({
//         where: { isCurrent: true },
//         data: { isCurrent: false },
//       });
//     }

//     return this.prisma.academicSession.create({
//       data: {
//         ...sessionData,
//         isCurrent: isCurrent || false,
//       },
//     });
//   }

//   async findAll() {
//     return this.prisma.academicSession.findMany({
//       orderBy: {
//         startDate: 'desc',
//       },
//     });
//   }

//   async findCurrent() {
//     return this.prisma.academicSession.findFirst({
//       where: { isCurrent: true },
//     });
//   }

//   async findOne(id: string) {
//     const session = await this.prisma.academicSession.findUnique({
//       where: { id },
//     });

//     if (!session) {
//       throw new NotFoundException('Academic session not found');
//     }

//     return session;
//   }

//   async update(id: string, updateAcademicSessionDto: UpdateAcademicSessionDto) {
//     await this.findOne(id); // Check if exists

//     const { isCurrent, ...updateData } = updateAcademicSessionDto;

//     // If setting as current, deactivate other current sessions
//     if (isCurrent) {
//       await this.prisma.academicSession.updateMany({
//         where: { 
//           isCurrent: true,
//           id: { not: id }
//         },
//         data: { isCurrent: false },
//       });
//     }

//     return this.prisma.academicSession.update({
//       where: { id },
//       data: {
//         ...updateData,
//         ...(isCurrent !== undefined ? { isCurrent } : {}),
//       },
//     });
//   }

//   async remove(id: string) {
//     await this.findOne(id); // Check if exists
//     return this.prisma.academicSession.delete({
//       where: { id },
//     });
//   }

//   async setCurrent(id: string) {
//     await this.findOne(id); // Check if exists

//     // Deactivate other current sessions
//     await this.prisma.academicSession.updateMany({
//       where: { 
//         isCurrent: true,
//         id: { not: id }
//       },
//       data: { isCurrent: false },
//     });

//     // Set this session as current
//     return this.prisma.academicSession.update({
//       where: { id },
//       data: { isCurrent: true },
//     });
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

@Injectable()
export class AcademicSessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createAcademicSessionDto: CreateAcademicSessionDto) {
    const { isCurrent, ...sessionData } = createAcademicSessionDto;

    // If setting as current, deactivate other current sessions
    if (isCurrent) {
      await this.prisma.academicSession.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicSession.create({
      data: {
        ...sessionData,
        isCurrent: isCurrent || false,
      },
    });
  }

  async findAll() {
    return this.prisma.academicSession.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findCurrent() {
    return this.prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }

    return session;
  }

  async update(id: string, updateAcademicSessionDto: UpdateAcademicSessionDto) {
    await this.findOne(id); // Check if exists

    const { isCurrent, ...updateData } = updateAcademicSessionDto;

    // If setting as current, deactivate other current sessions
    if (isCurrent) {
      await this.prisma.academicSession.updateMany({
        where: { 
          isCurrent: true,
          id: { not: id }
        },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicSession.update({
      where: { id },
      data: {
        ...updateData,
        ...(isCurrent !== undefined ? { isCurrent } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.academicSession.delete({
      where: { id },
    });
  }

  async setCurrent(id: string) {
    await this.findOne(id); // Check if exists

    // Deactivate other current sessions
    await this.prisma.academicSession.updateMany({
      where: { 
        isCurrent: true,
        id: { not: id }
      },
      data: { isCurrent: false },
    });

    // Set this session as current
    return this.prisma.academicSession.update({
      where: { id },
      data: { isCurrent: true },
    });
  }
}