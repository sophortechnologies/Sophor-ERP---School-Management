import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SectionController],
  providers: [SectionService, PrismaService],
  exports: [SectionService],
})
export class SectionModule {}
