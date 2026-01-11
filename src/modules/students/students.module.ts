// src/modules/student-admission/student-admission.module.ts
import { Module } from '@nestjs/common';
import { StudentService } from './students.service';
import { StudentController } from './students.controller';
import { PrismaModule } from '../../database/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [StudentController],
  providers: [StudentService,],
  exports: [StudentService],
})
export class StudentModule {}
