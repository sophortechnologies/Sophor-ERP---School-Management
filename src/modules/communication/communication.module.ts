// communication.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
