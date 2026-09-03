// src/modules/billing/modules/payments.module.ts

import { Module } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsController } from '../controllers/payments.controller';
import { PrismaModule } from '../../../database/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
