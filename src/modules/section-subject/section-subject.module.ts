import { Module } from '@nestjs/common';
import { SectionSubjectService } from './section-subject.service';
import { SectionSubjectController } from './section-subject.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SectionSubjectController],
  providers: [SectionSubjectService, PrismaService],
  exports: [SectionSubjectService],
})
export class SectionSubjectModule {}
