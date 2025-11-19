

import { Module } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service';
import { AcademicSessionsController } from './academic-sessions.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicSessionsController],
  providers: [AcademicSessionsService],
  exports: [AcademicSessionsService],
})
export class AcademicSessionsModule {}