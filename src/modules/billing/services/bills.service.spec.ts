import { Test, TestingModule } from '@nestjs/testing';
import { BillsService } from './bills.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BillStatus } from '../enums/bill-status.enum';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  bill: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  billConfiguration: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const mockBillConfig = {
  id: 1,
  feeType: 'TUITION',
  amount: 5000,
  isActive: true,
  classId: 1,
};

const mockBill = {
  id: 1,
  studentId: 1,
  billConfigId: 1,
  billCode: 'BILL-123456',
  totalAmount: 5000,
  status: BillStatus.UNPAID,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdBy: 1,
  createdAt: new Date(),
};

const validCreateDto = {
  studentId: 1,
  billConfigIds: [1],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('BillsService', () => {
  let service: BillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    jest.clearAllMocks();
  });

  // ── create ─────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create a bill and return it', async () => {
      mockPrisma.billConfiguration.findMany.mockResolvedValue([mockBillConfig]);
      mockPrisma.bill.create.mockResolvedValue(mockBill);

      const result = await service.create(validCreateDto, 1);

      expect(result.id).toBe(1);
      expect(result.status).toBe(BillStatus.UNPAID);
      expect(mockPrisma.bill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studentId: 1,
            status: BillStatus.UNPAID,
            createdBy: 1,
          }),
        }),
      );
    });

    it('should sum amounts from multiple bill configs', async () => {
      const twoConfigs = [
        { ...mockBillConfig, id: 1, amount: 3000 },
        { ...mockBillConfig, id: 2, amount: 2000 },
      ];
      mockPrisma.billConfiguration.findMany.mockResolvedValue(twoConfigs);
      mockPrisma.bill.create.mockResolvedValue({ ...mockBill, totalAmount: 5000 });

      const result = await service.create({ ...validCreateDto, billConfigIds: [1, 2] }, 1);

      // Total should be 3000 + 2000 = 5000
      expect(mockPrisma.bill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalAmount: 5000 }),
        }),
      );
    });

    it('should throw BadRequestException when no valid bill configs found', async () => {
      mockPrisma.billConfiguration.findMany.mockResolvedValue([]); // none found / inactive

      await expect(service.create(validCreateDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate a unique bill code', async () => {
      mockPrisma.billConfiguration.findMany.mockResolvedValue([mockBillConfig]);
      mockPrisma.bill.create.mockResolvedValue(mockBill);

      await service.create(validCreateDto, 1);

      const createCall = mockPrisma.bill.create.mock.calls[0][0];
      expect(createCall.data.billCode).toMatch(/^BILL-\d+$/);
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    beforeEach(() => {
      // Prisma.$transaction([promise1, promise2]) executes each promise in order
      mockPrisma.$transaction.mockImplementation((queries: any) =>
        Array.isArray(queries) ? Promise.all(queries) : queries(mockPrisma),
      );
      mockPrisma.bill.findMany.mockResolvedValue([mockBill]);
      mockPrisma.bill.count.mockResolvedValue(1);
    });

    it('should return paginated bill list with metadata', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should skip correct number of records for page 2', async () => {
      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrisma.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should return empty list when no bills exist', async () => {
      mockPrisma.bill.findMany.mockResolvedValue([]);
      mockPrisma.bill.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return bill with payments and config', async () => {
      mockPrisma.bill.findUnique.mockResolvedValue({
        ...mockBill,
        payments: [],
        config: mockBillConfig,
      });

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result).toHaveProperty('payments');
      expect(result).toHaveProperty('config');
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      mockPrisma.bill.findUnique.mockResolvedValue(null);

      await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with correct ID in message', async () => {
      mockPrisma.bill.findUnique.mockResolvedValue(null);

      try {
        await service.findOne(42);
      } catch (err: any) {
        expect(err.message).toContain('42');
      }
    });
  });

  // ── findByStudent ──────────────────────────────────────────────────────────
  describe('findByStudent()', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation((queries: any) =>
        Array.isArray(queries) ? Promise.all(queries) : queries(mockPrisma),
      );
      mockPrisma.bill.findMany.mockResolvedValue([mockBill]);
      mockPrisma.bill.count.mockResolvedValue(1);
    });

    it('should return bills only for the given student', async () => {
      await service.findByStudent({ studentId: 1, page: 1, limit: 10 });

      expect(mockPrisma.bill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: 1 },
        }),
      );
    });

    it('should return correct pagination metadata', async () => {
      const result = await service.findByStudent({ studentId: 1, page: 1, limit: 5 });

      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────
  describe('updateStatus()', () => {
    it('should update bill status to PAID', async () => {
      mockPrisma.bill.update.mockResolvedValue({ ...mockBill, status: BillStatus.PAID });

      const result = await service.updateStatus(1, BillStatus.PAID);

      expect(result.status).toBe(BillStatus.PAID);
      expect(mockPrisma.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { status: BillStatus.PAID },
        }),
      );
    });

    it('should update bill status to OVERDUE', async () => {
      mockPrisma.bill.update.mockResolvedValue({ ...mockBill, status: BillStatus.OVERDUE });

      const result = await service.updateStatus(1, BillStatus.OVERDUE);

      expect(result.status).toBe(BillStatus.OVERDUE);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the bill', async () => {
      mockPrisma.bill.delete.mockResolvedValue(mockBill);

      await service.remove(1);

      expect(mockPrisma.bill.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });
});
