// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';

// ========== CORE MODULES ==========
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassModule } from './modules/class/class.module';
import { AdminModule } from './modules/admin/admin.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { SchoolConfigurationModule } from './modules/school-configuration/school-configuration.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { SectionModule } from './modules/section/section.module';
import { StudentModule } from './modules/students/students.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { GradingModule } from './modules/grading/grading.module';
import { SectionSubjectModule } from './modules/section-subject/section-subject.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { ParentModule } from './modules/parent/parent.module';
import { StaffModule } from './modules/staff/staff.module';
import { SubjectModule } from './modules/subject/subject.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { NotificationModule } from './modules/notification/notification.module';

// ========== PHASE 3: FINANCE ==========
import { BillingModule } from './modules/billing/billing.module';
// ========== RBAC & AUTHORIZATION ==========
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionFilterInterceptor } from './common/interceptors/permission-filter.interceptor';
import { HolidayModule } from './modules/holiday/holiday.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { StaffAttendanceModule } from './modules/staff-attendance/staff-attendance.module';
import { StaffLeaveModule } from './modules/staff-leave/staff-leave.module';
@Module({
  imports: [
    // ========== CONFIGURATION ==========
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ========== INFRA ==========
    PrismaModule,

    // ========== AUTH & CORE ==========
    AuthModule,
    UsersModule,

    // ========== ACADEMIC CORE ==========
    SchoolConfigurationModule,
    AcademicSessionsModule,
    ClassModule,
    SectionModule,
    SectionSubjectModule,
    SubjectModule,
    TimetableModule,
    GradingModule,
    AttendanceModule,

    // ========== PEOPLE ==========
    StudentModule,
    ParentModule,
    TeacherModule,
    StaffModule,
    DepartmentsModule,
    HolidayModule,

    // ========== ADMIN ==========
    AdminModule,
    NotificationModule,

    // ========== FINANCE (PHASE 3) ==========
    BillingModule,
    PayrollModule,
    StaffAttendanceModule,
    StaffLeaveModule
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ========== GLOBAL SECURITY PIPELINE ==========
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1️⃣ Authentication
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 2️⃣ Role-based access
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // 3️⃣ Permission-level access
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PermissionFilterInterceptor, // 4️⃣ Data filtering
    },
  ],
})
export class AppModule {}
