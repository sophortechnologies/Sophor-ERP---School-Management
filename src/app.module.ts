import { Module } from '@nestjs/common'; 
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { AppController } from './app.controller'; 
import { AppService } from './app.service'; 
// Feature Modules 
import { AuthModule } from './modules/auth/auth.module'; 
// import { StudentsModule } from '../modules/students/students.module'; 
// import { AttendanceModule } from './modules/attendance/attendance.module'; 
// import { ExaminationsModule } from './modules/examinations/examinations.module'; 
// import { FinanceModule } from './modules/finance/finance.module'; 
// import { LibraryModule } from './modules/library/library.module'; 
// import { PayrollModule } from './modules/payroll/payroll.module'; 
// import { ReportsModule } from './modules/reports/reports.module'; 
 
/** 
 * Root Application Module 
 * Imports all feature modules and configures database connection 
 */ 
@Module({ 
  imports: [ 
    // Configuration 
    ConfigModule.forRoot({ 
      isGlobal: true, 
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, 
    }), 
 
    // Database 
    TypeOrmModule.forRootAsync({ 
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (config: ConfigService) => ({ 
        type: 'postgres', 
        host: config.get('DB_HOST'), 
        port: config.get('DB_PORT'), 
        username: config.get('DB_USERNAME'), 
        password: config.get('DB_PASSWORD'), 
        database: config.get('DB_NAME'), 
        entities: [__dirname + '/**/*.entity{.ts,.js}'], 
        synchronize: config.get('DB_SYNC') === 'true', 
        logging: config.get('NODE_ENV') === 'development', 
      }), 
    }), 
 
    // Feature Modules 
    AuthModule, 
    // StudentsModule, 
    // AttendanceModule, 
    // ExaminationsModule, 
    // FinanceModule, 
    // LibraryModule, 
    // PayrollModule, 
    // ReportsModule, 
  ], 
  controllers: [AppController], 
  providers: [AppService], 
}) 
export class AppModule {} 
