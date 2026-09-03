// src/modules/notification/notification.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';

// JwtModule is provided by AuthModule (@Global) — no need to re-register here.
// NotificationGateway injects JwtService which is available via the global AuthModule export.

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
