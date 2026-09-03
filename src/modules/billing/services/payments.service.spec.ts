import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BillStatus } from '../enums/bill-status.enum';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bill: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const futureDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const pastDueDate   = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

const mockBill = {
  id: 1,
  studentId: 1,
  totalAmount: 5000,
  status: BillStatus.UNPAID,
  dueDate: futureDueDate,
  payments: [],
};

const mockPayment = {
  id: 1,
  studentId: 1,
  billId: 1,
  amountPaid: 5000,
  paymentMethod: 'CASH',
  paymentDate: new Date(),
  status: 'SUCCESS',
};

const validRecordDto = {
  studentId: 1,
  billId: 1,
  amountPaid: 5000,
  paymentMethod: 'CASH',
  paymentDate: new Date().toISOString().split('T')[0],
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  // ── record ─────────────────────────────────────────────────────────────────
  describe('record()', () => {
    /**
     * The record() method runs inside $transaction.
     * We mock $transaction to call the callback with a tx object
     * that mirrors the mock prisma interface.
     */
    const setupTransaction = (billOverride: Partial<typeof mockBill> = {}) => {
      const bill = { ...mockBill, ...billOverride };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          bill: {
            findUnique: jest.fn().mockResolvedValue(bill),
            update: jest.fn().mockResolvedValue({ ...bill }),
          },
          payment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
        };
        return cb(tx);
      });
    };

    it('should record a full payment and mark bill as PAID', async () => {
      setupTransaction(); // full 5000 payment against 5000 bill

      const result = await service.record(validRecordDto);

      expect(result.payment.id).toBe(1);
      expect(result.remainingBalance).toBe(0);
      expect(result.billStatus).toBe(BillStatus.PAID);
    });

    it('should mark bill as PARTIAL when payment is less than total', async () => {
      setupTransaction();

      const result = await service.record({ ...validRecordDto, amountPaid: 2000 });

      expect(result.remainingBalance).toBe(3000);
      expect(result.billStatus).toBe(BillStatus.PARTIAL);
    });

    it('should mark bill as OVERDUE when partial payment is made on an overdue bill', async () => {
      setupTransaction({ dueDate: pastDueDate }); // past due date

      const result = await service.record({ ...validRecordDto, amountPaid: 1000 });

      expect(result.billStatus).toBe(BillStatus.OVERDUE);
    });

    it('should account for existing partial payments when calculating remaining balance', async () => {
      // Bill has 2000 already paid → remaining is 3000
      setupTransaction({
        payments: [{ amountPaid: 2000 }] as any,
      });

      const result = await service.record({ ...validRecordDto, amountPaid: 3000 });

      expect(result.remainingBalance).toBe(0);
      expect(result.billStatus).toBe(BillStatus.PAID);
    });

    it('should throw NotFoundException when bill does not exist', async () => {
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          bill: { findUnique: jest.fn().mockResolvedValue(null) },
          payment: { create: jest.fn() },
        };
        return cb(tx);
      });

      await expect(service.record(validRecordDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when bill does not belong to the student', async () => {
      // Bill belongs to studentId 99, not 1
      setupTransaction({ studentId: 99 });

      await expect(service.record(validRecordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when amountPaid is zero', async () => {
      setupTransaction();

      await expect(
        service.record({ ...validRecordDto, amountPaid: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amountPaid is negative', async () => {
      setupTransaction();

      await expect(
        service.record({ ...validRecordDto, amountPaid: -100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amountPaid exceeds remaining balance', async () => {
      // Bill total is 5000, already paid 2000 → remaining 3000
      setupTransaction({ payments: [{ amountPaid: 2000 }] as any });

      await expect(
        service.record({ ...validRecordDto, amountPaid: 4000 }), // exceeds 3000 remaining
      ).rejects.toThrow(BadRequestException);
    });

    it('should update bill status inside the transaction', async () => {
      let billUpdateArgs: any;
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          bill: {
            findUnique: jest.fn().mockResolvedValue(mockBill),
            update: jest.fn().mockImplementation((args: any) => {
              billUpdateArgs = args;
              return Promise.resolve({ ...mockBill, ...args.data });
            }),
          },
          payment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
        };
        return cb(tx);
      });

      await service.record(validRecordDto);

      expect(billUpdateArgs.where).toEqual({ id: 1 });
      expect(billUpdateArgs.data.status).toBe(BillStatus.PAID);
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return all payments ordered by date descending', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([mockPayment]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { paymentDate: 'desc' },
        }),
      );
    });

    it('should return empty array when no payments exist', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return payment when found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.amountPaid).toBe(5000);
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update payment amount and return updated record', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue({ ...mockPayment, amountPaid: 3000 });

      const result = await service.update(1, { amountPaid: 3000, paymentMethod: 'BANK' });

      expect(result.amountPaid).toBe(3000);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('should throw NotFoundException when payment to update does not exist', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.update(9999, { amountPaid: 1000 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should convert paymentDate string to Date object', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.payment.update.mockResolvedValue(mockPayment);

      const dateString = '2026-10-01T00:00:00.000Z';
      await service.update(1, { paymentDate: dateString });

      const updateCall = mockPrisma.payment.update.mock.calls[0][0];
      expect(updateCall.data.paymentDate).toBeInstanceOf(Date);
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the payment when it exists', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.payment.delete.mockResolvedValue(mockPayment);

      await service.remove(1);

      expect(mockPrisma.payment.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.remove(9999)).rejects.toThrow(NotFoundException);
    });
  });
});
