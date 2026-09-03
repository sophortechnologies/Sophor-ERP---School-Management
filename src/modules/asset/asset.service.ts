// src/modules/asset/asset.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../database/prisma.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { DepreciationService } from './depreciation.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';
import { TransferAssetDto } from './dto/transfer-asset.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { DisposeAssetDto } from './dto/dispose-asset.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { AssetStatus, DisposalType } from './enums/asset.enum';
import { AssetDashboardStats, AssetReport } from './interfaces/asset.interface';
import { AssetSummary } from './interfaces/asset.interface';
import { BudgetService } from '../budget/budget.service';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    private depreciationService: DepreciationService,
    private eventEmitter: EventEmitter2,
    private budgetService: BudgetService,
    
  ) {}

  private generateAssetTag(category: string): string {
    const year = new Date().getFullYear();
    const prefix = category.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  async createAsset(dto: CreateAssetDto, userId: number) {
    const assetTag = this.generateAssetTag(dto.category);

    const asset = await this.prisma.asset.create({
      data: {
        assetTag,
        name: dto.name,
        model: dto.model,
        manufacturer: dto.manufacturer,
        serialNumber: dto.serialNumber,
        category: dto.category,
        subCategory: dto.subCategory,
        purchaseDate: new Date(dto.purchaseDate),
        purchaseCost: dto.purchaseCost,
        vendorName: dto.vendorName,
        invoiceNumber: dto.invoiceNumber,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : null,
        depreciationMethod: dto.depreciationMethod,
        usefulLifeYears: dto.usefulLifeYears,
        salvageValue: dto.salvageValue || 0,
        currentValue: dto.purchaseCost,
        currentLocation: dto.currentLocation,
        maintenanceInterval: dto.maintenanceInterval,
        notes: dto.notes,
        status: AssetStatus.ACTIVE,
        createdBy: userId,
      },
    });

    // Calculate next maintenance date
    if (dto.maintenanceInterval) {
      const nextMaintenanceDate = new Date();
      nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + dto.maintenanceInterval);
      await this.prisma.asset.update({
        where: { id: asset.id },
        data: { nextMaintenanceDate },
      });
    }

    this.eventEmitter.emit('asset.created', { assetId: asset.id, userId });

    return asset;
  }

  async findAll(query: AssetQueryDto) {
    const where: any = { deletedAt: null };

    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.departmentId) where.assignedToDepartmentId = query.departmentId;
    if (query.userId) where.assignedToUserId = query.userId;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.warrantyExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.warrantyExpiry = { lte: thirtyDaysFromNow, gt: new Date() };
    }

    if (query.maintenanceDue) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.nextMaintenanceDate = { lte: thirtyDaysFromNow, not: null };
    }

    const result = await this.paginationService.paginate(this.prisma.asset, query, {
      where,
      include: {
        assignedToUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedToDepartment: {
          select: { id: true, name: true },
        },
      },
      searchFields: ['name', 'assetTag', 'serialNumber'],
    });

    return result;
  }


  async findByAssetTag(assetTag: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { assetTag, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with tag ${assetTag} not found`);
    }

    return asset;
  }

  async updateAsset(id: number, dto: UpdateAssetDto, userId: number) {
    await this.findOne(id);

    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        updatedBy: userId,
      },
    });

    this.eventEmitter.emit('asset.updated', { assetId: id, userId });

    return asset;
  }

  async assignAsset(id: number, dto: AssignAssetDto, userId: number) {
    const asset = await this.findOne(id);

    if (asset.status !== AssetStatus.ACTIVE) {
      throw new BadRequestException(`Cannot assign asset with status ${asset.status}`);
    }

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        assignedToUserId: dto.userId,
        assignedToDepartmentId: dto.departmentId,
        currentLocation: dto.location,
        assignedAt: new Date(),
        assignedBy: userId,
      },
    });

    this.eventEmitter.emit('asset.assigned', {
      assetId: id,
      userId: dto.userId,
      departmentId: dto.departmentId,
      assignedBy: userId,
    });

    return updated;
  }

  async returnAsset(id: number, condition: string, userId: number) {
    await this.findOne(id);

    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        assignedToUserId: null,
        assignedToDepartmentId: null,
        assignedAt: null,
        assignedBy: null,
      },
    });

    this.eventEmitter.emit('asset.returned', { assetId: id, condition, returnedBy: userId });

    return asset;
  }

  async transferAsset(id: number, dto: TransferAssetDto, userId: number) {
    const asset = await this.findOne(id);

    const transfer = await this.prisma.assetTransfer.create({
      data: {
        assetId: id,
        fromUserId: asset.assignedToUserId,
        fromDepartmentId: asset.assignedToDepartmentId,
        fromLocation: asset.currentLocation,
        toUserId: dto.toUserId,
        toDepartmentId: dto.toDepartmentId,
        toLocation: dto.toLocation,
        reason: dto.reason,
        condition: dto.condition,
        authorizedBy: userId,
      },
    });

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        assignedToUserId: dto.toUserId,
        assignedToDepartmentId: dto.toDepartmentId,
        currentLocation: dto.toLocation,
        assignedAt: new Date(),
        assignedBy: userId,
      },
    });

    this.eventEmitter.emit('asset.transferred', { assetId: id, transferId: transfer.id });

    return { transfer, asset: updated };
  }

  async scheduleMaintenance(id: number, dto: CreateMaintenanceDto, userId: number) {
    await this.findOne(id);

    const maintenance = await this.prisma.assetMaintenance.create({
      data: {
        assetId: id,
        maintenanceDate: new Date(),
        type: dto.type,
        description: dto.description,
        cost: dto.cost,
        vendorName: dto.vendorName,
        technicianName: dto.technicianName,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        invoiceNumber: dto.invoiceNumber,
        remarks: dto.remarks,
        performedBy: userId,
      },
    });

    if (dto.nextDueDate) {
      await this.prisma.asset.update({
        where: { id },
        data: {
          lastMaintenanceDate: new Date(),
          nextMaintenanceDate: new Date(dto.nextDueDate),
          maintenanceCost: { increment: dto.cost },
        },
      });
    }

    this.eventEmitter.emit('asset.maintenance.scheduled', { assetId: id, maintenanceId: maintenance.id });

    return maintenance;
  }

  async disposeAsset(id: number, dto: DisposeAssetDto, userId: number) {
    const asset = await this.findOne(id);

    const disposal = await this.prisma.assetDisposal.create({
  data: {
    assetId: id,
    disposalDate: new Date(),
    disposalType: dto.disposalType,
    saleAmount: dto.saleAmount ? dto.saleAmount : null,
    disposalCost: dto.disposalCost ? dto.disposalCost : null,
    buyerName: dto.buyerName,
    reason: dto.reason,
    authorizedBy: userId,
    notes: dto.notes,
    authorizedAt: new Date(),
  },
});

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        status: AssetStatus.DISPOSED,
        updatedBy: userId,
      },
    });

    this.eventEmitter.emit('asset.disposed', { assetId: id, disposalId: disposal.id, userId });

    return { disposal, asset: updated };
  }

  async deleteAsset(id: number, userId: number) {
    await this.findOne(id);

    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
        status: AssetStatus.RETIRED,
      },
    });

    this.eventEmitter.emit('asset.deleted', { assetId: id, userId });

    return { message: 'Asset deleted successfully', asset };
  }

  async getDashboardStats(): Promise<AssetDashboardStats> {
    const [totalAssets, totalValue, depreciatedValue, assetsByCategory, assetsByStatus] = await Promise.all([
      this.prisma.asset.count({ where: { deletedAt: null, status: { not: 'DISPOSED' } } }),
      this.prisma.asset.aggregate({
        where: { deletedAt: null, status: { not: 'DISPOSED' } },
        _sum: { purchaseCost: true },
      }),
      this.prisma.asset.aggregate({
        where: { deletedAt: null, status: { not: 'DISPOSED' } },
        _sum: { currentValue: true },
      }),
      this.prisma.asset.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: true,
      }),
      this.prisma.asset.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [maintenanceDueCount, warrantyExpiringCount] = await Promise.all([
      this.prisma.asset.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          nextMaintenanceDate: { lte: thirtyDaysFromNow, not: null },
        },
      }),
      this.prisma.asset.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          warrantyExpiry: { lte: thirtyDaysFromNow, gt: new Date() },
        },
      }),
    ]);

    const categoryMap: Record<string, number> = {};
    assetsByCategory.forEach((item) => {
      categoryMap[item.category] = item._count;
    });

    const statusMap: Record<string, number> = {};
    assetsByStatus.forEach((item) => {
      statusMap[item.status] = item._count;
    });

    return {
      totalAssets,
      totalValue: totalValue._sum.purchaseCost?.toNumber() || 0,
      depreciatedValue: depreciatedValue._sum.currentValue?.toNumber() || 0,
      assetsByCategory: categoryMap,
      assetsByStatus: statusMap,
      maintenanceDueCount,
      warrantyExpiringCount,
    };
  }

  async getAssetReport(): Promise<AssetReport> {
    const assets = await this.prisma.asset.findMany({
      where: { deletedAt: null, status: { not: 'DISPOSED' } },
      include: {
        assignedToUser: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const totalOriginalCost = assets.reduce((sum, a) => sum + a.purchaseCost.toNumber(), 0);
    const totalCurrentValue = assets.reduce((sum, a) => sum + (a.currentValue?.toNumber() || 0), 0);
    const totalDepreciation = totalOriginalCost - totalCurrentValue;

    const assetSummaries: AssetSummary[] = assets.map((a) => ({
      id: a.id,
      assetTag: a.assetTag,
      name: a.name,
      category: a.category,
      purchaseCost: a.purchaseCost.toNumber(),
      currentValue: a.currentValue?.toNumber() || 0,
      status: a.status,
      assignedTo: a.assignedToUser
        ? `${a.assignedToUser.firstName} ${a.assignedToUser.lastName}`
        : null,
    }));

    return {
      totalAssets: assets.length,
      totalOriginalCost,
      totalCurrentValue,
      totalDepreciation,
      assets: assetSummaries,
    };
  }

  async getDueForMaintenance() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.prisma.asset.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        nextMaintenanceDate: { lte: thirtyDaysFromNow, not: null },
      },
      include: {
        assignedToUser: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async getWarrantyExpiringSoon() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.prisma.asset.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        warrantyExpiry: { lte: thirtyDaysFromNow, gt: new Date() },
      },
      include: {
        assignedToUser: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async getAssetsByUser(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  const assets = await this.prisma.asset.findMany({
    where: {
      assignedToUserId: userId,
      deletedAt: null,
      status: 'ACTIVE',
    },
    include: {
      assignedToUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      assignedToDepartment: {
        select: { id: true, name: true },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return {
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    },
    totalAssets: assets.length,
    assets,
  };
}

 async findOne(id: number) {
  const asset = await this.prisma.asset.findUnique({
    where: { id, deletedAt: null },
    include: {
      assignedToUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      assignedToDepartment: {
        select: { id: true, name: true },
      },
      depreciationHistory: {
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ],
        take: 12,
      },
      maintenanceRecords: {
        orderBy: { maintenanceDate: 'desc' },
      },
      transfers: {
        orderBy: { transferDate: 'desc' },
      },
    },
  });

  if (!asset) {
    throw new NotFoundException(`Asset with ID ${id} not found`);
  }

  const depreciationSchedule = await this.depreciationService.getDepreciationSchedule(id);

  return { ...asset, depreciationSchedule };
}

  async runMonthlyDepreciation() {
    return this.depreciationService.runMonthlyDepreciation();
  }

  // In asset.service.ts - when creating asset
async createAssetWithBudget(dto: CreateAssetDto, userId: number) {
  console.log(' STEP 1: Method started');
  
  const currentYear = new Date().getFullYear();
  const fiscalYear = `${currentYear}-${currentYear + 1}`;
  console.log(` STEP 2: Looking for CAPITAL budget with fiscalYear: ${fiscalYear}`);
  
  const capitalBudget = await this.prisma.budget.findFirst({
    where: {
      fiscalYear: fiscalYear,
      category: 'CAPITAL',
    },
  });

  console.log(` STEP 3: Found budget: ${capitalBudget?.id}, Status: ${capitalBudget?.status}`);

  if (capitalBudget && capitalBudget.status !== 'APPROVED') {
    console.log(` Budget exists but status is ${capitalBudget.status}, not APPROVED`);
  }

  if (capitalBudget) {
    console.log(` STEP 4: Checking availability for amount ${dto.purchaseCost}`);
    const budgetCheck = await this.budgetService.checkAvailability(
      capitalBudget.id,
      dto.purchaseCost,
    );
    console.log(` STEP 5: Available: ${budgetCheck.available}, Available Amount: ${budgetCheck.availableAmount}`);
  }

  console.log(` STEP 6: Creating asset...`);
  const asset = await this.createAsset(dto, userId);
  console.log(` STEP 7: Asset created with ID: ${asset.id}`);

  if (capitalBudget) {
    console.log(` STEP 8: Creating budget commitment...`);
    try {
      await this.budgetService.commitBudget(
        {
          budgetId: capitalBudget.id,
          amount: dto.purchaseCost,
          referenceType: 'ASSET',
          referenceId: asset.id,
          description: `Asset purchase: ${dto.name}`,
        },
        userId,
      );
      console.log(` STEP 9: Budget commitment created successfully`);
    } catch (error:any) {
      console.log(` STEP 9 FAILED: ${error.message}`);
    }
  } else {
    console.log(` STEP 8 SKIPPED: No CAPITAL budget found`);
  }

  return asset;
}
}