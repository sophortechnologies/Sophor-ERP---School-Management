// // import { Module } from '@nestjs/common';
// // import { StudentsService } from './students.service';
// // import { StudentsController } from './students.controller';
// // import { PrismaModule } from '../../database/prisma.module';

// // @Module({
// //   imports: [PrismaModule],
// //   controllers: [StudentsController],
// //   providers: [StudentsService],
// //   exports: [StudentsService],
// // })
// // export class StudentsModule {}
// import { Module } from '@nestjs/common';
// import { StudentsController } from './students.controller';
// import { StudentsService } from './students.service';

// @Module({
//   controllers: [StudentsController],
//   providers: [StudentsService],
//   exports: [StudentsService],
// })
// export class StudentsModule {}
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