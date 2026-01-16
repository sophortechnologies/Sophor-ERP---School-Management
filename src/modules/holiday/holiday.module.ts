import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HolidayController],
  providers: [HolidayService],
  exports: [HolidayService], 
})
export class HolidayModule {}
