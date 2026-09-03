// src/modules/budget/budget.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { BudgetControlService } from './budget-control.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetTransferDto } from './dto/budget-transfer.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { BudgetCommitmentDto } from './dto/budget-commitment.dto';
import { BudgetStatus, TransferStatus } from './enums/budget.enum';
import { BudgetUtilization } from './interfaces/budget.interface';
import {
  DepartmentBudgetSummary,
  BudgetDashboardStats,
  VarianceReport,
} from './interfaces/budget.interface';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private budgetControlService: BudgetControlService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createBudget(dto: CreateBudgetDto, userId: number) {
    const budget = await this.prisma.budget.create({
      data: {
        budgetCode: dto.budgetCode,
        fiscalYear: dto.fiscalYear,
        parentId: dto.parentId,
        departmentId: dto.departmentId,
        costCenter: dto.costCenter,
        category: dto.category,
        subCategory: dto.subCategory,
        budgetType: dto.budgetType,
        allocatedAmount: dto.allocatedAmount,
        availableAmount: dto.allocatedAmount,
        softStopPercent: dto.softStopPercent || 80,
        hardStopPercent: dto.hardStopPercent || 100,
        alertEmail: dto.alertEmail,
        allowRollover: dto.allowRollover || false,
        rolloverToNextYear: dto.rolloverToNextYear || false,
        notes: dto.notes,
        status: BudgetStatus.DRAFT,
        createdBy: userId,
      },
    });

    this.eventEmitter.emit('budget.created', { budgetId: budget.id, userId });

    return budget;
  }

  async findAll(query: BudgetQueryDto) {
    const where: any = {};

    if (query.fiscalYear) where.fiscalYear = query.fiscalYear;
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

    const result = await this.paginationService.paginate(this.prisma.budget, query, {
      where,
      include: {
        department: { select: { id: true, name: true } },
        parent: { select: { id: true, budgetCode: true } },
      },
    });

    return result;
  }

  async findOne(id: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        department: true,
        parent: true,
        children: { take: 10 },
        commitments: {
          where: { status: 'ACTIVE' },
          orderBy: { committedAt: 'desc' },
          take: 20,
        },
        actuals: {
          orderBy: { recordedAt: 'desc' },
          take: 20,
        },
        transfersFrom: {
  orderBy: { requestedAt: 'desc' },
  take: 20,
},
transfersTo: {
  orderBy: { requestedAt: 'desc' },
  take: 20,
},
        alerts: {
          where: { isResolved: false },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const utilization = await this.budgetControlService.getBudgetUtilization(id);

    return { ...budget, utilization };
  }

  async updateBudget(id: number, dto: UpdateBudgetDto, userId: number) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException(`Cannot update budget in ${budget.status} status`);
    }

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        ...dto,
        allocatedAmount: dto.allocatedAmount,
        availableAmount: dto.allocatedAmount
          ? dto.allocatedAmount - (budget.committedAmount?.toNumber() || 0) - (budget.actualAmount?.toNumber() || 0)
          : undefined,
        updatedBy: userId,
      },
    });

    this.eventEmitter.emit('budget.updated', { budgetId: id, userId });

    return updated;
  }

  async submitBudget(id: number, userId: number) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit budget in ${budget.status} status`);
    }

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.SUBMITTED,
        submittedBy: userId,
        submittedAt: new Date(),
      },
    });

    this.eventEmitter.emit('budget.submitted', { budgetId: id, userId });

    return updated;
  }

  async approveBudget(id: number, userId: number) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.SUBMITTED && budget.status !== BudgetStatus.UNDER_REVIEW) {
      throw new BadRequestException(`Cannot approve budget in ${budget.status} status`);
    }

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    this.eventEmitter.emit('budget.approved', { budgetId: id, userId });

    return updated;
  }

  async rejectBudget(id: number, reason: string, userId: number) {
    const budget = await this.findOne(id);

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.REJECTED,
        rejectionReason: reason,
        updatedBy: userId,
      },
    });

    this.eventEmitter.emit('budget.rejected', { budgetId: id, userId, reason });

    return updated;
  }

  async freezeBudget(id: number, userId: number) {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.APPROVED) {
      throw new BadRequestException(`Cannot freeze budget in ${budget.status} status`);
    }

    const updated = await this.prisma.budget.update({
      where: { id },
      data: {
        status: BudgetStatus.FROZEN,
        frozenAt: new Date(),
        updatedBy: userId,
      },
    });

    return updated;
  }

  async requestTransfer(dto: BudgetTransferDto, userId: number) {
    const fromBudget = await this.findOne(dto.fromBudgetId);
    const toBudget = await this.findOne(dto.toBudgetId);

    if (fromBudget.status !== BudgetStatus.APPROVED) {
      throw new BadRequestException(`Source budget is not approved`);
    }

    if (toBudget.status !== BudgetStatus.APPROVED) {
      throw new BadRequestException(`Target budget is not approved`);
    }

    const fromUtilization = await this.budgetControlService.getBudgetUtilization(dto.fromBudgetId);
    const availableAmount = fromUtilization.availableAmount;

    if (dto.amount > availableAmount) {
      throw new BadRequestException(
        `Insufficient funds in source budget. Available: ₹${availableAmount}`,
      );
    }

    const transfer = await this.prisma.budgetTransfer.create({
      data: {
        transferNumber: `TRF-${Date.now()}`,
        fromBudgetId: dto.fromBudgetId,
        toBudgetId: dto.toBudgetId,
        amount: dto.amount,
        reason: dto.reason,
        justification: dto.justification,
        status: TransferStatus.PENDING,
        requestedBy: userId,
      },
    });

    this.eventEmitter.emit('budget.transfer.requested', {
      transferId: transfer.id,
      fromBudgetId: dto.fromBudgetId,
      toBudgetId: dto.toBudgetId,
      amount: dto.amount,
      userId,
    });

    return transfer;
  }

  async approveTransfer(transferId: number, userId: number) {
    const transfer = await this.prisma.budgetTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${transferId} not found`);
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException(`Transfer is already ${transfer.status}`);
    }

    const updated = await this.prisma.budgetTransfer.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    return updated;
  }

  async executeTransfer(transferId: number, userId: number) {
    const transfer = await this.prisma.budgetTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${transferId} not found`);
    }

    if (transfer.status !== TransferStatus.APPROVED) {
      throw new BadRequestException(`Transfer must be approved before execution`);
    }

    await this.prisma.$transaction([
      this.prisma.budget.update({
        where: { id: transfer.fromBudgetId },
        data: {
          allocatedAmount: { decrement: transfer.amount },
          availableAmount: { decrement: transfer.amount },
        },
      }),
      this.prisma.budget.update({
        where: { id: transfer.toBudgetId },
        data: {
          allocatedAmount: { increment: transfer.amount },
          availableAmount: { increment: transfer.amount },
        },
      }),
      this.prisma.budgetTransfer.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.EXECUTED,
          executedAt: new Date(),
        },
      }),
    ]);

    this.eventEmitter.emit('budget.transfer.executed', {
      transferId,
      fromBudgetId: transfer.fromBudgetId,
      toBudgetId: transfer.toBudgetId,
      amount: transfer.amount,
      userId,
    });

    return { message: 'Transfer executed successfully' };
  }

  async rejectTransfer(transferId: number, reason: string, userId: number) {
    const transfer = await this.prisma.budgetTransfer.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    this.eventEmitter.emit('budget.transfer.rejected', {
      transferId,
      reason,
      userId,
    });

    return transfer;
  }

  async getVarianceReport(budgetId: number): Promise<VarianceReport> {
    const budget = await this.findOne(budgetId);
    const allocated = budget.allocatedAmount.toNumber();
    const actual = budget.actualAmount?.toNumber() || 0;
    const variance = allocated - actual;
    const variancePercentage = (variance / allocated) * 100;

    return {
      budgetId: budget.id,
      budgetCode: budget.budgetCode,
      allocatedAmount: allocated,
      actualAmount: actual,
      variance,
      variancePercentage,
      type: variance >= 0 ? 'FAVORABLE' : 'UNFAVORABLE',
      period: budget.fiscalYear,
    };
  }

  async getDepartmentBudgetSummary(departmentId: number, fiscalYear: string): Promise<DepartmentBudgetSummary> {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department ${departmentId} not found`);
    }

    const budgets = await this.prisma.budget.findMany({
      where: {
        departmentId,
        fiscalYear,
        status: BudgetStatus.APPROVED,
      },
    });

    const categories: BudgetUtilization[] = [];
    let totalAllocated = 0;
    let totalCommitted = 0;
    let totalActual = 0;

    for (const budget of budgets) {
      const utilization = await this.budgetControlService.getBudgetUtilization(budget.id);
      categories.push(utilization);
      totalAllocated += utilization.allocatedAmount;
      totalCommitted += utilization.committedAmount;
      totalActual += utilization.actualAmount;
    }

    const totalAvailable = totalAllocated - totalCommitted - totalActual;
    const utilizationPercentage = totalAllocated > 0 ? ((totalCommitted + totalActual) / totalAllocated) * 100 : 0;

    return {
      departmentId: department.id,
      departmentName: department.name,
      totalAllocated,
      totalCommitted,
      totalActual,
      totalAvailable,
      utilizationPercentage,
      categories,
    };
  }

  async getDashboardStats(fiscalYear: string): Promise<BudgetDashboardStats> {
    const budgets = await this.prisma.budget.findMany({
      where: {
        fiscalYear,
        status: BudgetStatus.APPROVED,
      },
    });

    let totalBudget = 0;
    let totalCommitted = 0;
    let totalActual = 0;
    let departmentsAtRisk = 0;

    const departments = new Set<number>();

    for (const budget of budgets) {
      totalBudget += budget.allocatedAmount.toNumber();
      totalCommitted += budget.committedAmount?.toNumber() || 0;
      totalActual += budget.actualAmount?.toNumber() || 0;

      if (budget.departmentId) {
        departments.add(budget.departmentId);
      }

      const utilization = await this.budgetControlService.getBudgetUtilization(budget.id);
      if (utilization.status === 'CRITICAL' || utilization.status === 'EXCEEDED') {
        departmentsAtRisk++;
      }
    }

    const totalAvailable = totalBudget - totalCommitted - totalActual;
    const overallUtilization = totalBudget > 0 ? ((totalCommitted + totalActual) / totalBudget) * 100 : 0;

    const activeAlerts = await this.prisma.budgetAlert.count({
      where: {
        budget: {
          fiscalYear,
        },
        isResolved: false,
      },
    });

    return {
      fiscalYear,
      totalBudget,
      totalCommitted,
      totalActual,
      totalAvailable,
      overallUtilization,
      departmentsAtRisk,
      activeAlerts,
    };
  }

  async getPendingTransfers() {
    return this.prisma.budgetTransfer.findMany({
      where: { status: TransferStatus.PENDING },
      include: {
        fromBudget: {
          include: { department: true },
        },
        toBudget: {
          include: { department: true },
        },
        requestedByUser: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  }

  async getActiveAlerts() {
    return this.prisma.budgetAlert.findMany({
      where: { isResolved: false },
      include: {
        budget: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkAvailability(budgetId: number, amount: number) {
    return this.budgetControlService.checkAvailability(budgetId, amount);
  }

  async commitBudget(dto: BudgetCommitmentDto, userId: number) {
    return this.budgetControlService.commitBudget(
      dto.budgetId,
      dto.amount,
      dto.referenceType,
      dto.referenceId,
      dto.description,
      userId,
    );
  }

  async releaseCommitment(commitmentId: number, userId: number) {
    return this.budgetControlService.releaseCommitment(commitmentId, userId);
  }

  async resolveAlert(alertId: number, userId: number) {
    return this.budgetControlService.resolveAlert(alertId, userId);
  }

  async deleteBudget(id: number) {
  const budget = await this.findOne(id);
  
  if (budget.status !== 'DRAFT') {
    throw new BadRequestException(`Cannot delete budget in ${budget.status} status`);
  }
  
  await this.prisma.budget.delete({ where: { id } });
  
  return { message: 'Budget deleted successfully' };
}

private async checkAndCreateAlerts(budgetId: number) {
  const budget = await this.prisma.budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget) return;

  const allocated = budget.allocatedAmount.toNumber();
  const actual = budget.actualAmount?.toNumber() || 0;
  const committed = budget.committedAmount?.toNumber() || 0;
  const usedPercentage = ((actual + committed) / allocated) * 100;
  const softStop = budget.softStopPercent || 80;
  const hardStop = budget.hardStopPercent || 100;

  if (usedPercentage >= softStop && usedPercentage < hardStop) {
    const existingAlert = await this.prisma.budgetAlert.findFirst({
      where: {
        budgetId,
        alertType: 'SOFT_STOP',
        isResolved: false,
      },
    });

    if (!existingAlert) {
      await this.prisma.budgetAlert.create({
        data: {
          budgetId,
          alertType: 'SOFT_STOP',
          percentageUsed: Math.floor(usedPercentage),
          threshold: softStop,
          message: `Budget ${budget.budgetCode} has reached ${Math.floor(usedPercentage)}% of allocation. Review spending.`,
        },
      });
    }
  }

  if (usedPercentage >= hardStop) {
    const existingAlert = await this.prisma.budgetAlert.findFirst({
      where: {
        budgetId,
        alertType: 'HARD_STOP',
        isResolved: false,
      },
    });

    if (!existingAlert) {
      await this.prisma.budgetAlert.create({
        data: {
          budgetId,
          alertType: 'HARD_STOP',
          percentageUsed: Math.floor(usedPercentage),
          threshold: hardStop,
          message: `Budget ${budget.budgetCode} has reached ${Math.floor(usedPercentage)}% of allocation. No further expenses allowed.`,
        },
      });
    }
  }
}


async recordActual(
  budgetId: number,
  amount: number,
  referenceType: string,
  referenceId: number,
  description: string,
  userId: number,
) {
  // Check if budget exists
  const budget = await this.prisma.budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget) {
    throw new NotFoundException(`Budget with ID ${budgetId} not found`);
  }

  // Check if budget is approved (only approved budgets can have actuals)
  if (budget.status !== 'APPROVED') {
    throw new BadRequestException(`Cannot record actual expense for budget with status ${budget.status}`);
  }

  // Check if amount exceeds available budget
  const available = budget.availableAmount.toNumber();
  if (amount > available) {
    throw new BadRequestException(
      `Amount ${amount} exceeds available budget of ${available}. Request a budget transfer first.`,
    );
  }

  // Create actual record
  const actual = await this.prisma.budgetActual.create({
    data: {
      budgetId,
      actualNumber: `ACT-${Date.now()}`,
      referenceType,
      referenceId,
      amount,
      description,
      recordedBy: userId,
    },
  });

  // Update budget actual amount and available amount
  await this.prisma.budget.update({
    where: { id: budgetId },
    data: {
      actualAmount: { increment: amount },
      availableAmount: { decrement: amount },
    },
  });

  // Check if there's an active commitment for this reference and realize it
  const commitment = await this.prisma.budgetCommitment.findFirst({
    where: {
      budgetId,
      referenceType,
      referenceId,
      status: 'ACTIVE',
    },
  });

  if (commitment) {
    await this.prisma.budgetCommitment.update({
      where: { id: commitment.id },
      data: {
        status: 'REALIZED',
        realizedAt: new Date(),
      },
    });
  }

  return actual;
}
}