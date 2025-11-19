// // // import { NestFactory, Reflector } from '@nestjs/core';
// // // import { ValidationPipe, Logger } from '@nestjs/common';
// // // import { ConfigService } from '@nestjs/config';
// // // import helmet from 'helmet';
// // // import compression from 'compression';
// // // import rateLimit from 'express-rate-limit';

// // // import { AppModule } from './app.module';
// // // import { setupSwagger } from './config/swagger.config';
// // // import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// // // async function bootstrap() {
// // //   const logger = new Logger('Bootstrap');
// // //   const app = await NestFactory.create(AppModule, {
// // //     logger: ['log', 'error', 'warn', 'debug', 'verbose'],
// // //     cors: true,
// // //   });

// // //   const configService = app.get(ConfigService);
// // //   const reflector = app.get(Reflector);

// // //   // Security Middleware
// // //   app.use(helmet({
// // //     crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   }));
// // //   app.use(compression());

// // //   // Rate Limiting
// // //   app.use(
// // //     rateLimit({
// // //       windowMs: 15 * 60 * 1000, // 15 minutes
// // //       max: 1000, // limit each IP to 1000 requests per windowMs
// // //       message: {
// // //         statusCode: 429,
// // //         message: 'Too many requests from this IP, please try again later.',
// // //         error: 'Too Many Requests',
// // //       },
// // //     }),
// // //   );

// // //   // Global Validation
// // //   app.useGlobalPipes(
// // //     new ValidationPipe({
// // //       whitelist: true,
// // //       forbidNonWhitelisted: true,
// // //       transform: true,
// // //       transformOptions: {
// // //         enableImplicitConversion: true,
// // //       },
// // //       validationError: {
// // //         target: false,
// // //         value: false,
// // //       },
// // //     }),
// // //   );

// // //   // Global Guards
// // //   app.useGlobalGuards(new JwtAuthGuard(reflector));

// // //   // CORS Configuration
// // //   const frontendUrl = configService.get('frontend.url');
// // //   app.enableCors({
// // //     origin: [
// // //       frontendUrl,
// // //       'http://localhost:3000',
// // //       'http://localhost:3001',
// // //       'https://your-frontend.onrender.com',
// // //     ],
// // //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// // //     allowedHeaders: [
// // //       'Content-Type',
// // //       'Authorization',
// // //       'X-Requested-With',
// // //       'Accept',
// // //       'Origin',
// // //       'Access-Control-Allow-Headers',
// // //       'Access-Control-Request-Method',
// // //       'Access-Control-Request-Headers',
// // //     ],
// // //     credentials: true,
// // //     preflightContinue: false,
// // //     optionsSuccessStatus: 204,
// // //   });

// // //   // Global Prefix
// // //   const globalPrefix = configService.get('apiPrefix') || '/api/v1';
// // //   app.setGlobalPrefix(globalPrefix);

// // //   // Swagger Documentation
// // //   if (configService.get('environment') !== 'production') {
// // //     setupSwagger(app);
// // //   }

// // //   // Server Configuration
// // //   const port = configService.get('port') || 5000;
// // //   await app.listen(port);

// // //   // Startup Logging
// // //   logger.log(`🚀 Application is running on: http://localhost:${port}`);
// // //   logger.log(`🌐 Environment: ${configService.get('environment')}`);
// // //   logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
// // //   logger.log(`🔐 API Base URL: http://localhost:${port}${globalPrefix}`);
// // //   logger.log(`📊 Database: ${configService.get('database.url') ? 'Connected' : 'Disconnected'}`);

// // //   // Graceful shutdown
// // //   process.on('SIGINT', async () => {
// // //     logger.log('🛑 Received SIGINT, shutting down gracefully...');
// // //     await app.close();
// // //     process.exit(0);
// // //   });

// // //   process.on('SIGTERM', async () => {
// // //     logger.log('🛑 Received SIGTERM, shutting down gracefully...');
// // //     await app.close();
// // //     process.exit(0);
// // //   });
// // // }

// // // bootstrap().catch(error => {
// // //   Logger.error('❌ Failed to start application', error);
// // //   process.exit(1);
// // // });

// // // import { NestFactory, Reflector } from '@nestjs/core';
// // // import { ValidationPipe, Logger } from '@nestjs/common';
// // // import { ConfigService } from '@nestjs/config';
// // // import helmet from 'helmet';
// // // import 'reflect-metadata';

// // // import * as compression from 'compression';
// // // import { rateLimit } from 'express-rate-limit';  // ← Fixed: named import

// // // import { AppModule } from './app.module';
// // // import { setupSwagger } from './config/swagger.config';
// // // import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// // // async function bootstrap() {
// // //   const logger = new Logger('Bootstrap');
// // //   const app = await NestFactory.create(AppModule, {
// // //     logger: ['log', 'error', 'warn', 'debug', 'verbose'],
// // //     cors: true,
// // //   });

// // //   const configService = app.get(ConfigService);
// // //   const reflector = app.get(Reflector);

// // //   // Security Middleware
// // //   app.use(helmet({
// // //     crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   }));
// // //   app.use(compression());

// // //   // Rate Limiting
// // //   app.use(
// // //     rateLimit({
// // //       windowMs: 15 * 60 * 1000, // 15 minutes
// // //       max: 1000, // limit each IP to 1000 requests per windowMs
// // //       message: {
// // //         statusCode: 429,
// // //         message: 'Too many requests from this IP, please try again later.',
// // //         error: 'Too Many Requests',
// // //       },
// // //     }),
// // //   );

// // //   // Global Validation
// // //   app.useGlobalPipes(
// // //     new ValidationPipe({
// // //       whitelist: true,
// // //       forbidNonWhitelisted: true,
// // //       transform: true,
// // //       transformOptions: {
// // //         enableImplicitConversion: true,
// // //       },
// // //       validationError: {
// // //         target: false,
// // //         value: false,
// // //       },
// // //     }),
// // //   );

// // //   // Global Guards
// // //   app.useGlobalGuards(new JwtAuthGuard(reflector));

// // //   // CORS Configuration
// // //   const frontendUrl = configService.get('frontend.url');
// // //   app.enableCors({
// // //     origin: [
// // //       frontendUrl,
// // //       'http://localhost:3000',
// // //       'http://localhost:3001',
// // //       'https://your-frontend.onrender.com',
// // //     ],
// // //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
// // //     allowedHeaders: [
// // //       'Content-Type',
// // //       'Authorization',
// // //       'X-Requested-With',
// // //       'Accept',
// // //       'Origin',
// // //       'Access-Control-Allow-Headers',
// // //       'Access-Control-Request-Method',
// // //       'Access-Control-Request-Headers',
// // //     ],
// // //     credentials: true,
// // //     preflightContinue: false,
// // //     optionsSuccessStatus: 204,
// // //   });

// // //   // Global Prefix
// // //   const globalPrefix = configService.get('apiPrefix') || '/api/v1';
// // //   app.setGlobalPrefix(globalPrefix);

// // //   // Swagger Documentation
// // //   if (configService.get('environment') !== 'production') {
// // //     setupSwagger(app);
// // //   }

// // //   // Server Configuration
// // //   const port = configService.get('port') || 5000;
// // //   await app.listen(port);

// // //   // Startup Logging
// // //   logger.log(` Application is running on: http://localhost:${port}`);
// // //   logger.log(` Environment: ${configService.get('environment')}`);
// // //   logger.log(` API Documentation: http://localhost:${port}/api/docs`);
// // //   logger.log(` API Base URL: http://localhost:${port}${globalPrefix}`);
// // //   logger.log(` Database: ${configService.get('database.url') ? 'Connected' : 'Disconnected'}`);

// // //   // Graceful shutdown
// // //   process.on('SIGINT', async () => {
// // //     logger.log(' Received SIGINT, shutting down gracefully...');
// // //     await app.close();
// // //     process.exit(0);
// // //   });

// // //   process.on('SIGTERM', async () => {
// // //     logger.log(' Received SIGTERM, shutting down gracefully...');
// // //     await app.close();
// // //     process.exit(0);
// // //   });
// // // }

// // // bootstrap().catch(error => {
// // //   Logger.error(' Failed to start application', error);
// // //   process.exit(1);
// // // });

// // // import { NestFactory } from '@nestjs/core';
// // // import { ConfigService } from '@nestjs/config'; // ← ADD THIS IMPORT
// // // import { ValidationPipe } from '@nestjs/common';
// // // import { AppModule } from './app.module';
// // // import * as portfinder from 'portfinder';

// // // async function bootstrap() {
// // //   const app = await NestFactory.create(AppModule);
  
// // //   // Get ConfigService instance
// // //   const configService = app.get(ConfigService); // ← ADD THIS LINE
  
// // //   // Enable CORS
// // //   app.enableCors();
  
// // //   // Enable validation
// // //   app.useGlobalPipes(new ValidationPipe());
  
// // //   // Get port from config service or default to 5000
// // //   const desiredPort = configService.get<number>('PORT') || 5000;
  
// // //   try {
// // //     // Find available port
// // //     const port = await portfinder.getPortPromise({ 
// // //       port: desiredPort,
// // //       stopPort: desiredPort + 100 // Search up to 100 ports ahead
// // //     });
    
// // //     // Log if port changed
// // //     if (port !== desiredPort) {
// // //       console.log(`  Port ${desiredPort} is busy, using port ${port} instead`);
// // //     }
    
// // //     // Start the application
// // //     await app.listen(port);
    
// // //     console.log(` Server running on http://localhost:${port}`);
// // //     console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    
// // //   } catch (error) {
// // //     // Handle port in use error
// // //     console.error(` Port ${configService.get('PORT') || 5000} is already in use.`);
// // //     console.error('Error:', error.message);
// // //     process.exit(1);
// // //   }
// // // }

// // // bootstrap();

// // import { NestFactory } from '@nestjs/core';
// // import { ConfigService } from '@nestjs/config';
// // import { ValidationPipe, Logger } from '@nestjs/common';
// // import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// // import { AppModule } from './app.module';
// // import * as portfinder from 'portfinder';

// // async function bootstrap() {
// //   const logger = new Logger('Bootstrap');
  
// //   try {
// //     const app = await NestFactory.create(AppModule);
    
// //     // Get ConfigService instance
// //     const configService = app.get(ConfigService);
    
// //     // Enable CORS with configuration
// //     // app.enableCors({
// //     //   origin: configService.get('CORS_ORIGIN') || [
// //     //     'http://localhost:3000',
// //     //     'http://localhost:5000',
// //     //     'http://192.168.137.146:5000',
// //     //     'http://192.168.137.220:3000'
// //     //   ],
// //     //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //     //   credentials: true,
// //     // });

// //     // In your main.ts file - Update the CORS section
// // app.enableCors({
// //   origin: [
// //     'http://localhost:5173',        // Vite default frontend
// //     'http://localhost:3000',        // Create React App
// //     'http://192.168.137.220:5173',  // Your friend's frontend
// //     'http://192.168.137.220:3000',  // Your friend's alternative frontend
// //     'http://192.168.137.146:5173',  // Your IP with frontend
// //     'http://192.168.137.146:3000'   // Your IP alternative
// //   ],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// // });
    
// //     // Enable validation with strict settings
// //     app.useGlobalPipes(new ValidationPipe({
// //       whitelist: true,
// //       forbidNonWhitelisted: true,
// //       transform: true,
// //       transformOptions: {
// //         enableImplicitConversion: true,
// //       },
// //     }));
    
// //     //  SWAGGER CONFIGURATION
// //     const swaggerConfig = new DocumentBuilder()
// //       .setTitle('School ERP API')
// //       .setDescription('Complete API documentation for School ERP')
// //       .setVersion('1.0')
// //       .addBearerAuth(
// //         {
// //           type: 'http',
// //           scheme: 'bearer',
// //           bearerFormat: 'JWT',
// //           name: 'JWT',
// //           description: 'Enter JWT token',
// //           in: 'header',
// //         },
// //         'JWT-auth',
// //       )
// //       .addTag('auth', 'Authentication endpoints')
// //       .addTag('users', 'User management endpoints')
// //       .addTag('students', 'Student management endpoints')
// //       .addTag('modules', 'Module management endpoints')
// //       .build();

// //     const document = SwaggerModule.createDocument(app, swaggerConfig);
// //     SwaggerModule.setup('api', app, document, {
// //       swaggerOptions: {
// //         persistAuthorization: true,
// //         tagsSorter: 'alpha',
// //         operationsSorter: 'alpha',
// //         docExpansion: 'none',
// //         filter: true,
// //         showRequestDuration: true,
// //       },
// //       customSiteTitle: 'University API Documentation',
// //     });
    
// //     // Get port from config service or default to 5000
// //     const desiredPort = configService.get<number>('PORT') || 5000;
    
// //     // Find available port
// //     const port = await portfinder.getPortPromise({ 
// //       port: desiredPort,
// //       stopPort: desiredPort + 100
// //     });
    
// //     // Log if port changed
// //     if (port !== desiredPort) {
// //       logger.warn(` Port ${desiredPort} is busy, using port ${port} instead`);
// //     }
    
// //     // Start the application
// //     await app.listen(port, '0.0.0.0');
    
// //     //  Enhanced logging with Swagger information
// //     logger.log(` Server running on http://localhost:${port}`);
// //     logger.log(` Network access: http://192.168.137.146:${port}`);
// //     logger.log(`Swagger documentation: http://localhost:${port}/api`);
// //     logger.log(`OpenAPI JSON: http://localhost:${port}/api-json`);
// //     logger.log(` Environment: ${configService.get('NODE_ENV') || 'development'}`);
// //     logger.log(`Database: ${configService.get('DATABASE_URL') ? 'Connected' : 'Not configured'}`);
    
// //   } catch (error) {
// //     logger.error('Failed to start application');
// //     logger.error(`Error: ${error.message}`);
    
// //     // Specific error handling - use the desiredPort variable instead
// //     if (error.code === 'EADDRINUSE') {
// //       const desiredPort = 5000; // Default port
// //       logger.error(` Try: 
// //         - Use a different PORT environment variable
// //         - Kill the process using the port: "npx kill-port ${desiredPort}"
// //         - Wait a few seconds and try again`);
// //     }
    
// //     process.exit(1);
// //   }
// // }

// // bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { ConfigService } from '@nestjs/config';
// import { ValidationPipe, Logger } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { AppModule } from './app.module';
// import * as portfinder from 'portfinder';

// async function bootstrap() {
//   const logger = new Logger('Bootstrap');
//   let desiredPort = 5000;

//   try {
//     const app = await NestFactory.create(AppModule);
//     const configService = app.get(ConfigService);
    
//     // ✅ FIXED CORS CONFIGURATION
//     // app.enableCors({
//     //   origin: [
//     //     'http://localhost:5173',
//     //     'http://localhost:3000',
//     //     'http://192.168.137.220:5173',
//     //     'http://192.168.137.220:3000',
//     //     'http://192.168.137.146:5173',
//     //     'http://192.168.137.146:3000'
//     //   ],
//     //   credentials: true,
//     //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
//     // });
    
//     // Better approach - dynamic CORS for development
// app.enableCors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://localhost:5177', 
//       'http://localhost:3000',
//       'http://192.168.137.220:5173',
//       'http://192.168.137.220:3000',
//       'http://192.168.137.146:5173',
//       'http://192.168.137.146:3000',
//       'http://10.13.188.49:5177',
//       'http://10.13.188.49:5173',
//       'http://10.13.188.49:3000'
//     ];
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log('Blocked by CORS:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// });

//     // Enable validation
//     app.useGlobalPipes(new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }));
    
//     // Swagger configuration
//     const swaggerConfig = new DocumentBuilder()
//       .setTitle('School ERP API')
//       .setDescription('API Documentation')
//       .setVersion('1.0')
//       .addBearerAuth()
//       .build();

//     const document = SwaggerModule.createDocument(app, swaggerConfig);
//     SwaggerModule.setup('api', app, document);
    
//     // Get port
//     desiredPort = configService.get<number>('PORT') || 5000;
    
//     // Find available port
//     const port = await portfinder.getPortPromise({ 
//       port: desiredPort,
//       stopPort: desiredPort + 100
//     });
    
//     if (port !== desiredPort) {
//       logger.warn(`  Port ${desiredPort} is busy, using port ${port} instead`);
//     }
    
//     // Start application
//     await app.listen(port, '0.0.0.0');
    
//     logger.log(` Server running on http://localhost:${port}`);
//     logger.log(` Network access: http://192.168.137.146:${port}`);
//     logger.log(` Swagger documentation: http://localhost:${port}/api`);
//     logger.log(` Frontend should use: http://localhost:${port} for API calls`);
    
//   } catch (error) {
//     logger.error('Failed to start application');
//     logger.error(`Error: ${error.message}`);
    
//     if (error.code === 'EADDRINUSE') {
//       logger.error(` Try: npx kill-port ${desiredPort}`);
//     }
    
//     process.exit(1);
//   }
// }

// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with proper configuration
  app.enableCors({
    origin: [
      'http://localhost:5190',  // Your frontend URL
      'http://localhost:5173',  // Vite default
      'http://localhost:3000',  // React default
      'http://localhost:4200',  // Angular default
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(` Server running on http://localhost:${port}`);
}

bootstrap();