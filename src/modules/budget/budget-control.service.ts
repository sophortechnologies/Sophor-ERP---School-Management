// src/modules/budget/budget-control.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AvailabilityResult, BudgetUtilization } from './interfaces/budget.interface';
import { AlertType, CommitmentStatus } from './enums/budget.enum';

@Injectable()
export class BudgetControlService {
  private readonly logger = new Logger(BudgetControlService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async checkAvailability(budgetId: number, requestedAmount: number): Promise<AvailabilityResult> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    const allocated = budget.allocatedAmount.toNumber();
    const committed = budget.committedAmount?.toNumber() || 0;
    const actual = budget.actualAmount?.toNumber() || 0;
    const available = allocated - committed - actual;
    const usedPercentage = ((committed + actual) / allocated) * 100;
    const newUsedPercentage = ((committed + actual + requestedAmount) / allocated) * 100;

    const softStop = budget.softStopPercent || 80;
    const hardStop = budget.hardStopPercent || 100;

    let level: 'OK' | 'SOFT_STOP' | 'HARD_STOP' = 'OK';
    let requiresApproval = false;
    let message: string | undefined;

    if (requestedAmount > available) {
      level = 'HARD_STOP';
      requiresApproval = true;
      message = `Requested amount ₹${requestedAmount} exceeds available budget of ₹${available}.`;
    } else if (newUsedPercentage >= hardStop) {
      level = 'HARD_STOP';
      requiresApproval = true;
      message = `This expense would exceed ${hardStop}% of budget. Transfer funds first.`;
    } else if (newUsedPercentage >= softStop) {
      level = 'SOFT_STOP';
      requiresApproval = true;
      message = `This expense would exceed ${softStop}% of budget. Manager approval required.`;
    }

    return {
      available: requestedAmount <= available && newUsedPercentage < hardStop,
      availableAmount: available,
      requestedAmount,
      usedPercentage,
      requiresApproval,
      level,
      message,
    };
  }

  async commitBudget(
    budgetId: number,
    amount: number,
    referenceType: string,
    referenceId: number,
    description: string,
    userId: number,
  ) {
    const availability = await this.checkAvailability(budgetId, amount);

    if (!availability.available) {
      throw new Error(`Cannot commit: ${availability.message}`);
    }

    const commitment = await this.prisma.budgetCommitment.create({
      data: {
        budgetId,
        commitmentNumber: `CMT-${Date.now()}`,
        referenceType,
        referenceId,
        amount,
        description,
        committedBy: userId,
        status: 'ACTIVE',
      },
    });

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        committedAmount: { increment: amount },
        availableAmount: { decrement: amount },
      },
    });

    await this.checkAndCreateAlerts(budgetId);

    this.eventEmitter.emit('budget.committed', {
      budgetId,
      commitmentId: commitment.id,
      amount,
      referenceType,
      referenceId,
      userId,
    });

    return commitment;
  }

  async releaseCommitment(commitmentId: number, userId: number) {
    const commitment = await this.prisma.budgetCommitment.findUnique({
      where: { id: commitmentId },
    });

    if (!commitment) {
      throw new Error(`Commitment ${commitmentId} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.budgetCommitment.update({
        where: { id: commitmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'Released by user',
        },
      }),
      this.prisma.budget.update({
        where: { id: commitment.budgetId },
        data: {
          committedAmount: { decrement: commitment.amount.toNumber() },
          availableAmount: { increment: commitment.amount.toNumber() },
        },
      }),
    ]);

    this.eventEmitter.emit('budget.commitment.released', {
      commitmentId,
      budgetId: commitment.budgetId,
      amount: commitment.amount,
      userId,
    });

    return { message: 'Commitment released successfully' };
  }

  async recordActual(
    budgetId: number,
    amount: number,
    referenceType: string,
    referenceId: number,
    description: string,
    userId: number,
  ) {
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

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        actualAmount: { increment: amount },
        availableAmount: { decrement: amount },
      },
    });

    // Check if there's a commitment to realize
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

    await this.checkAndCreateAlerts(budgetId);

    this.eventEmitter.emit('budget.actual.recorded', {
      budgetId,
      actualId: actual.id,
      amount,
      referenceType,
      referenceId,
      userId,
    });

    return actual;
  }

  async getBudgetUtilization(budgetId: number): Promise<BudgetUtilization> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    const allocated = budget.allocatedAmount.toNumber();
    const committed = budget.committedAmount?.toNumber() || 0;
    const actual = budget.actualAmount?.toNumber() || 0;
    const available = allocated - committed - actual;
    const utilizationPercentage = ((committed + actual) / allocated) * 100;

    let status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXCEEDED' = 'SAFE';
    const softStop = budget.softStopPercent || 80;
    const hardStop = budget.hardStopPercent || 100;

    if (utilizationPercentage >= hardStop) {
      status = 'EXCEEDED';
    } else if (utilizationPercentage >= softStop) {
      status = 'CRITICAL';
    } else if (utilizationPercentage >= softStop - 20) {
      status = 'WARNING';
    }

    return {
      budgetId: budget.id,
      budgetCode: budget.budgetCode,
      allocatedAmount: allocated,
      committedAmount: committed,
      actualAmount: actual,
      availableAmount: available,
      utilizationPercentage,
      softStopThreshold: softStop,
      hardStopThreshold: hardStop,
      status,
    };
  }

  async checkAndCreateAlerts(budgetId: number) {
    const utilization = await this.getBudgetUtilization(budgetId);

    if (utilization.status === 'CRITICAL' && utilization.utilizationPercentage >= utilization.softStopThreshold) {
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
            alertType: AlertType.SOFT_STOP,
            percentageUsed: utilization.utilizationPercentage,
            threshold: utilization.softStopThreshold,
            message: `Budget ${utilization.budgetCode} has reached ${utilization.utilizationPercentage.toFixed(1)}% of allocation. Review spending.`,
          },
        });

        this.eventEmitter.emit('budget.alert.created', {
          budgetId,
          type: 'SOFT_STOP',
          percentage: utilization.utilizationPercentage,
        });
      }
    }

    if (utilization.status === 'EXCEEDED' && utilization.utilizationPercentage >= utilization.hardStopThreshold) {
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
            alertType: AlertType.HARD_STOP,
            percentageUsed: utilization.utilizationPercentage,
            threshold: utilization.hardStopThreshold,
            message: `Budget ${utilization.budgetCode} has reached ${utilization.utilizationPercentage.toFixed(1)}% of allocation. No further expenses allowed without transfer.`,
          },
        });

        this.eventEmitter.emit('budget.alert.created', {
          budgetId,
          type: 'HARD_STOP',
          percentage: utilization.utilizationPercentage,
        });
      }
    }
  }

  async resolveAlert(alertId: number, userId: number) {
    return this.prisma.budgetAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
    });
  }
}