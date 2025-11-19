
import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service'; // Add this

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PrismaService], // Add PrismaService here
  exports: [StudentsService],
})
export class StudentsModule {}