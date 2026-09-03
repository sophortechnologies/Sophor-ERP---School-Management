// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './database/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { BillingModule } from './modules/billing/billing.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionFilterInterceptor } from './common/interceptors/permission-filter.interceptor';
import { HolidayModule } from './modules/holiday/holiday.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { StaffAttendanceModule } from './modules/staff-attendance/staff-attendance.module';
import { StaffLeaveModule } from './modules/staff-leave/staff-leave.module';
import { SalaryStructureModule } from './modules/salary-structure/salary-structure.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BudgetModule } from './modules/budget/budget.module';
import { AssetModule } from './modules/asset/asset.module';
import { EmailModule } from './modules/email/email.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { EmployeeAttendanceModule } from './modules/employee-attendance/employee-attendance.module';
import { EmployeeLeaveModule } from './modules/employee-leave/employee-leave.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting — wires the @Throttle decorator used on POST /auth/login
    // default: 10 req/min globally; login endpoint overrides to 5/min via @Throttle
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds in ms (v5 uses ms)
        limit: 10,
      },
    ]),
    CacheModule.register({
      ttl: 300000, // 5 minutes
      isGlobal: true,
    }),
    // Single global EventEmitter — asset, budget, timetable modules no longer call forRoot()
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchoolConfigurationModule,
    AcademicSessionsModule,
    ClassModule,
    SectionModule,
    SectionSubjectModule,
    SubjectModule,
    TimetableModule,
    GradingModule,
    AttendanceModule,
    StudentModule,
    ParentModule,
    TeacherModule,
    StaffModule,
    DepartmentsModule,
    HolidayModule,
    AdminModule,
    NotificationModule,
    BillingModule,
    PayrollModule,
    StaffAttendanceModule,
    StaffLeaveModule,
    SalaryStructureModule,
    CommunicationModule,
    CalendarModule,
    ReportsModule,
    BudgetModule,
    AssetModule,
    EmailModule,
    EmployeeAttendanceModule,
    EmployeeLeaveModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PermissionFilterInterceptor,
    },
  ],
})
export class AppModule {}
