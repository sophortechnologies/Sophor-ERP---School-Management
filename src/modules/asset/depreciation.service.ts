// src/modules/asset/depreciation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DepreciationResult, DepreciationScheduleItem } from './interfaces/asset.interface';
import { Asset } from '@prisma/client';
// Remove DepreciationMethod - use string or create local enum

@Injectable()
export class DepreciationService {
  private readonly logger = new Logger(DepreciationService.name);

  constructor(private prisma: PrismaService) {}

  calculateDepreciation(asset: Asset): DepreciationResult {
  const { purchaseCost, salvageValue, usefulLifeYears, depreciationMethod, currentValue } = asset;

  const salvage = salvageValue?.toNumber() || 0;
  const cost = purchaseCost.toNumber();

  // Use string comparison instead of enum
  if (depreciationMethod === 'STRAIGHT_LINE') {
    return this.calculateStraightLine(cost, salvage, usefulLifeYears, currentValue?.toNumber() || cost);
  } else {
    return this.calculateWrittenDownValue(cost, salvage, usefulLifeYears, currentValue?.toNumber() || cost);
  }
}

  private calculateStraightLine(
    cost: number,
    salvage: number,
    usefulLifeYears: number,
    currentValue: number,
  ): DepreciationResult {
    const annual = (cost - salvage) / usefulLifeYears;
    const monthly = annual / 12;
    const newValue = Math.max(currentValue - monthly, salvage);
    const accumulated = cost - newValue;

    return {
      annual,
      monthly,
      currentValue: newValue,
      accumulatedDepreciation: accumulated,
    };
  }

  private calculateWrittenDownValue(
    cost: number,
    salvage: number,
    usefulLifeYears: number,
    currentValue: number,
  ): DepreciationResult {
    const rate = 100 / usefulLifeYears;
    const annual = currentValue * (rate / 100);
    const monthly = annual / 12;
    const newValue = Math.max(currentValue - monthly, salvage);
    const accumulated = cost - newValue;

    return {
      annual,
      monthly,
      currentValue: newValue,
      accumulatedDepreciation: accumulated,
    };
  }

 async getDepreciationSchedule(assetId: number): Promise<DepreciationScheduleItem[]> {
  const asset = await this.prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    throw new Error('Asset not found');
  }

  const { purchaseCost, salvageValue, usefulLifeYears, depreciationMethod } = asset;
  const cost = purchaseCost.toNumber();
  const salvage = salvageValue?.toNumber() || 0;
  const schedule: DepreciationScheduleItem[] = [];

  let currentValue = cost;

  for (let year = 1; year <= usefulLifeYears; year++) {
    let depreciationAmount: number;

    // ✅ Use string comparison here too
    if (depreciationMethod === 'STRAIGHT_LINE') {
      depreciationAmount = (cost - salvage) / usefulLifeYears;
    } else {
      const rate = 100 / usefulLifeYears;
      depreciationAmount = currentValue * (rate / 100);
    }

    const closingValue = Math.max(currentValue - depreciationAmount, salvage);

    schedule.push({
      year,
      openingValue: currentValue,
      depreciationAmount,
      closingValue,
    });

    currentValue = closingValue;
  }

  return schedule;
}

  async runMonthlyDepreciation(): Promise<{ processed: number; totalDepreciation: number }> {
    const assets = await this.prisma.asset.findMany({
      where: {
        status: 'ACTIVE',
        fullyDepreciated: false,
        currentValue: { gt: 0 },
      },
    });

    let processed = 0;
    let totalDepreciation = 0;

    for (const asset of assets) {
      const { monthly } = this.calculateDepreciation(asset);
      const newValue = Math.max(asset.currentValue.toNumber() - monthly, asset.salvageValue?.toNumber() || 0);
      const accumulated = asset.purchaseCost.toNumber() - newValue;
      const fullyDepreciated = newValue <= (asset.salvageValue?.toNumber() || 0);

      await this.prisma.$transaction([
        this.prisma.asset.update({
          where: { id: asset.id },
          data: {
            currentValue: newValue,
            accumulatedDepreciation: accumulated,
            fullyDepreciated,
            lastDepreciationDate: new Date(),
          },
        }),
        this.prisma.depreciationHistory.create({
          data: {
            assetId: asset.id,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            openingValue: asset.currentValue,
            depreciationAmount: monthly,
            closingValue: newValue,
          },
        }),
      ]);

      processed++;
      totalDepreciation += monthly;
    }

    this.logger.log(`Monthly depreciation completed: ${processed} assets, total ₹${totalDepreciation}`);

    return { processed, totalDepreciation };
  }
}