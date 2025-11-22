
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockPrisma = {
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    academicSession: {
      findFirst: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
    section: {
      findUnique: jest.fn(),
    },
    guardian: {
      create: jest.fn(),
    },
    studentGuardian: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add simple test cases that don't rely on complex Prisma operations
});