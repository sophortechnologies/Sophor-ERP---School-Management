import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { PrismaModule } from 'prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
   imports: [
    PrismaModule,
    NotificationModule, 
  ],
  controllers: [CalendarController],
  providers: [CalendarService]
})
export class CalendarModule {}
