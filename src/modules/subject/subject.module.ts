import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, PrismaService],
  exports: [SubjectService], // Export if other modules need it
})
export class SubjectModule {}
