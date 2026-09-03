import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { SectionSubjectService } from './section-subject.service';
import { SectionSubjectController } from './section-subject.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SectionSubjectController],
  providers: [SectionSubjectService],
  exports: [SectionSubjectService],
})
export class SectionSubjectModule {}
