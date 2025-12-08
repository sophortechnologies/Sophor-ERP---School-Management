
import { Module } from '@nestjs/common';
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


// ========== ACADEMIC MODULES ==========
import { StudentModule } from './modules/students/students.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { GradingModule } from './modules/grading/grading.module';
// import { AttendanceModule } from './modules/attendance/attendance.module';

@Module({
  imports: [
    // ========== CONFIGURATION MODULES ==========
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // ========== CORE INFRASTRUCTURE MODULES ==========
    PrismaModule, // Database ORM and connection management
    
    // ========== AUTHENTICATION & AUTHORIZATION ==========
    AuthModule,    // User authentication (JWT, login, etc.)
    UsersModule,   // User management and profiles
    
    // ========== ACADEMIC MANAGEMENT MODULES ==========
    
    //  COMPLETED MODULES - Ready for production
    StudentModule,  // Complete student admission & registration system
    AcademicSessionsModule,  // Academic year and session management
    GradingModule,          // Complete examination & grading system
    // AttendanceModule, 
    ClassModule,
    AdminModule,
    TeacherModule,
    
    // ========== UPCOMING MODULES ==========
    // FeeManagementModule,    // Fee collection and management
    // LibraryModule,         // Library book management
    // InventoryModule,       // School inventory management
    // TimetableModule,       // Class schedule management
    // CommunicationModule,   // Notifications and messaging
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}