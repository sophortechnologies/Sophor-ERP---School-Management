import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../../database/prisma.module';
@Module({
   imports: [
    PrismaModule,
    NotificationModule, 
  ],
  controllers: [CalendarController],
  providers: [CalendarService]
})
export class CalendarModule {}
