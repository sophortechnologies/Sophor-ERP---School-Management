// src/modules/billing/billing.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';

// Core Billing Orchestration
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

// Sub-modules
import { BillConfigModule } from './bill-config/bill-config.module';
import { BillsModule } from './bills/bills.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    PrismaModule,

    // Billing domain sub-modules
    BillConfigModule,
    BillsModule,
    PaymentsModule,
  ],
  controllers: [
    BillingController, // Aggregated / Orchestrator endpoints
  ],
  providers: [
    BillingService,
  ],
  exports: [
    BillingService, // allow other modules (Accounting, Reports)
  ],
})
export class BillingModule {}
