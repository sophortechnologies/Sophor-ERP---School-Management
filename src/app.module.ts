// // import { Module } from '@nestjs/common';
// // import { ConfigModule, ConfigService } from '@nestjs/config';
// // import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// // import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
// // import { MorganInterceptor, MorganModule } from 'nest-morgan';

// // import { AppController } from './app.controller';
// // import { AppService } from './app.service';
// // import { PrismaModule } from './database/prisma.module';
// // import { AuthModule } from './modules/auth/auth.module';
// // import { UsersModule } from './modules/users/users.module';
// // import { ModulesModule } from './modules/modules-management/modules.module';

// // import configuration from './config/configuration';
// // import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
// // import { RolesGuard } from './common/guards/roles.guard';
// // import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// // @Module({
// //   imports: [
// //     // Configuration
// //     ConfigModule.forRoot({
// //       isGlobal: true,
// //       load: [configuration],
// //       cache: true,
// //     }),

// //     // Rate Limiting
// //     ThrottlerModule.forRootAsync({
// //       imports: [ConfigModule],
// //       inject: [ConfigService],
// //       useFactory: (config: ConfigService) => [
// //         {
// //           ttl: config.get('throttler.ttl'),
// //           limit: config.get('throttler.limit'),
// //         },
// //       ],
// //     }),

// //     // Logging
// //     MorganModule,

// //     // Database
// //     PrismaModule,

// //     // Feature Modules
// //     AuthModule,
// //     UsersModule,
// //     ModulesModule,
// //   ],
// //   controllers: [AppController],
// //   providers: [
// //     AppService,
    
// //     // Global Guards
// //     {
// //       provide: APP_GUARD,
// //       useClass: JwtAuthGuard,
// //     },
// //     {
// //       provide: APP_GUARD,
// //       useClass: RolesGuard,
// //     },
// //     {
// //       provide: APP_GUARD,
// //       useClass: ThrottlerGuard,
// //     },

// //     // Global Interceptors
// //     {
// //       provide: APP_INTERCEPTOR,
// //       useClass: TransformInterceptor,
// //     },
// //     {
// //       provide: APP_INTERCEPTOR,
// //       useClass: MorganInterceptor('combined'),
// //     },
// //   ],
// // })
// // export class AppModule {}

// import { Module } from '@nestjs/common';

// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { PrismaModule } from './database/prisma.module';
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// // import { ModulesMa } from './modules/modules-management/modules.module';
// // FIXED IMPORT - Choose one of these options:
// import { ModulesModule } from './modules/modules-management/modules.module';
// import { StudentsModule } from './modules/students/students.module';
// // OR if that doesn't work, try:
// // import { ModulesModule } from './modules/modules/modules.module';

// import configuration from './config/configuration';
// import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
// import { RolesGuard } from './common/guards/roles.guard';
// import { TransformInterceptor } from './common/interceptors/transform.interceptor';
// import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';



// @Module({
//   imports: [
//      PrismaModule,
//     AuthModule,
//     UsersModule,
//     StudentsModule,
//     // ModulesManagementModule,
//     AcademicSessionsModule, // Add this line
//     // Configuration
    
//     ConfigModule.forRoot({
//       isGlobal: true,
//       load: [configuration],
//       cache: true,
//     }),

//     // Rate Limiting
//     ThrottlerModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => [
//         {
//           ttl: config.get('throttler.ttl'),
//           limit: config.get('throttler.limit'),
//         },
//       ],
//     }),

//     // Database
//     PrismaModule,

//     // Feature Modules
//     AuthModule,
//     UsersModule,
//    ModulesModule, // Make sure this matches your import
//   StudentsModule, // Add this

//   ],
//   controllers: [AppController],
//   providers: [
//      ModulesModule,
    
//     // Global Guards
//     {
//       provide: APP_GUARD,
//       useClass: JwtAuthGuard,
//     },
//     {
//       provide: APP_GUARD,
//       useClass: RolesGuard,
//     },
//     {
//       provide: APP_GUARD,
//       useClass: ThrottlerGuard,
//     },

//     // Global Interceptors
//     {
//       provide: APP_INTERCEPTOR,
//       useClass: TransformInterceptor,
//     },
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { StudentsModule } from './modules/students/students.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AcademicSessionsModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}