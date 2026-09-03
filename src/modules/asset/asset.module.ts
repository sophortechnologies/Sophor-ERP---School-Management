import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BudgetModule } from '../budget/budget.module';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { DepreciationService } from './depreciation.service';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  imports: [PrismaModule, BudgetModule],
  controllers: [AssetController],
  providers: [
    AssetService,
    DepreciationService,
    PaginationService,
  ],
  exports: [AssetService, DepreciationService],
})
export class AssetModule {}
