// src/modules/billing/modules/bills.module.ts

import { Module } from '@nestjs/common';
import { BillsService } from '../services/bills.service';
import { BillsController } from '../controllers/bills.controller';
import { PrismaModule } from 'src/database/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
