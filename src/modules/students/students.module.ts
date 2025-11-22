
// // // // // import { Module } from '@nestjs/common';
// // // // // import { StudentsController } from './students.controller';
// // // // // import { StudentsService } from './students.service';
// // // // // import { PrismaService } from '../../database/prisma.service'; // Add this

// // // // // @Module({
// // // // //   controllers: [StudentsController],
// // // // //   providers: [StudentsService, PrismaService], // Add PrismaService here
// // // // //   exports: [StudentsService],
// // // // // })
// // // // // export class StudentsModule {}

// // // // import { Module } from '@nestjs/common';
// // // // import { StudentsService } from './students.service';
// // // // import { StudentAdvancedService } from './student-advanced.service';
// // // // import { GuardiansService } from './guardians.service';
// // // // import { DocumentsService } from './documents.service';
// // // // import { ReportsService } from './reports.service';
// // // // import { StudentsController } from './students.controller';
// // // // import { GuardiansController } from './guardians.controller';
// // // // import { DocumentsController } from './documents.controller';
// // // // import { ReportsController } from './reports.controller';

// // // // @Module({
// // // //   controllers: [
// // // //     StudentsController,
// // // //     GuardiansController,
// // // //     DocumentsController,
// // // //     ReportsController,
// // // //   ],
// // // //   providers: [
// // // //     StudentsService,
// // // //     StudentAdvancedService,
// // // //     GuardiansService,
// // // //     DocumentsService,
// // // //     ReportsService,
// // // //   ],
// // // //   exports: [
// // // //     StudentsService,
// // // //     StudentAdvancedService,
// // // //   ],
// // // // })
// // // // export class StudentsModule {}

// // // import { Module } from '@nestjs/common';
// // // import { StudentsService } from './students.service';
// // // import { StudentAdvancedService } from './student-advanced.service';
// // // import { GuardiansService } from './guardians.service';
// // // import { DocumentsService } from './documents.service';
// // // import { ReportsService } from './reports.service';
// // // import { StudentsController } from './students.controller';
// // // import { GuardiansController } from './guardians.controller';
// // // import { DocumentsController } from './documents.controller';
// // // import { ReportsController } from './reports.controller';

// // // @Module({
// // //   controllers: [
// // //     StudentsController,
// // //     GuardiansController,
// // //     DocumentsController,
// // //     ReportsController,
// // //   ],
// // //   providers: [
// // //     StudentsService,
// // //     StudentAdvancedService,
// // //     GuardiansService,
// // //     DocumentsService,
// // //     ReportsService,
// // //   ],
// // //   exports: [
// // //     StudentsService,
// // //     StudentAdvancedService,
// // //   ],
// // // })
// // // export class StudentsModule {}

// // import { Module } from '@nestjs/common';
// // import { StudentsService } from './students.service';
// // import { StudentsController } from './students.controller';

// // @Module({
// //   controllers: [StudentsController],
// //   providers: [StudentsService],
// //   exports: [StudentsService],
// // })
// // export class StudentsModule {}

// import { Module } from '@nestjs/common';
// import { StudentsService } from './students.service';
// import { StudentsController } from './students.controller';

// @Module({
//   controllers: [StudentsController],
//   providers: [StudentsService],
//   exports: [StudentsService],
// })
// export class StudentsModule {}

import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}