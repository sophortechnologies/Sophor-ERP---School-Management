// communication.module.ts
import { Module } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { PrismaService } from '../../database/prisma.service';
import { NotificationModule } from '../notification/notification.module';
@Module({
    imports: [NotificationModule],

  controllers: [CommunicationController],
  providers: [CommunicationService, PrismaService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
