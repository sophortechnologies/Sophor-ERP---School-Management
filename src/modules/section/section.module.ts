import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  imports: [PrismaModule],
  controllers: [SectionController],
  providers: [SectionService, PaginationService],
  exports: [SectionService],
})
export class SectionModule {}
