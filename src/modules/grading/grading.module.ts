import { Module } from '@nestjs/common';
import { GradingService } from './grading.service';
import { GradingController } from './grading.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [
    PrismaModule, // Database access
  ],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService], // Export if other modules need to use grading service
})
export class GradingModule {}