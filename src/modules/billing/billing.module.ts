// src/modules/billing/billing.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BillConfigModule } from './modules/bill-config.module';
import { BillsModule } from './modules/bills.module';
import { PaymentsModule } from './modules/payments.module';

@Module({
  imports: [
    PrismaModule,

    // Billing domain modules
    BillConfigModule,
    BillsModule,
    PaymentsModule,
  ],
  exports: [
    // Re-export sub-modules if other domains need billing features
    BillConfigModule,
    BillsModule,
    PaymentsModule,
  ],
})
export class BillingModule {}
