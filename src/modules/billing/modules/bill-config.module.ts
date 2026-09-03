// src/modules/billing/modules/bill-config.module.ts

import { Module } from '@nestjs/common';
import { BillConfigService } from '../services/bill-config.service';
import { BillConfigController } from '../controllers/bill-config.controller';
import { PrismaModule } from '../../../database/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [BillConfigController],
  providers: [BillConfigService],
  exports: [BillConfigService], // optional, but future-safe
})
export class BillConfigModule {}
