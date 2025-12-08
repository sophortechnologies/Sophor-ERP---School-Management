// // src/modules/student-admission/student-admission.module.ts
// import { Module } from '@nestjs/common';
// import { StudentService } from './students.service';
// import { StudentController } from './students.controller';
// import { PrismaModule } from '../../database/prisma.module';

// @Module({
//   imports: [PrismaModule],
//   controllers: [StudentController],
//   providers: [StudentService],
//   exports: [StudentService],
// })
// export class StudentModule {}

// src/modules/student-admission/student-admission.module.ts
import { Module } from '@nestjs/common';
import { StudentService } from './students.service';
import { StudentController } from './students.controller';
import { PrismaModule } from '../../database/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
