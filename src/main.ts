import { NestFactory } from '@nestjs/core'; 
import { ValidationPipe, Logger } from '@nestjs/common'; 
import { ConfigService } from '@nestjs/config'; 
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 
import { AppModule } from './app.module'; 
import { TransformInterceptor } from './common/interceptors/transform.interceptor'; 
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; 
/** 
* Bootstrap the NestJS application 
* Configures Swagger, validation, CORS, and global pipes/filters 
*/ 
async function bootstrap() { 
const app = await NestFactory.create(AppModule, { 
logger: ['error', 'warn', 'log', 'debug'], 
}); 
const configService = app.get(ConfigService); 
const port = configService.get<number>('PORT', 3000); 
const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1'); 
// Global API prefix 
app.setGlobalPrefix(apiPrefix); 
// Enable CORS 
app.enableCors({ 
origin: true, 
credentials: true, 
}); 
// Global validation pipe 
app.useGlobalPipes( 
new ValidationPipe({ 
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      transformOptions: { 
        enableImplicitConversion: true, 
      }, 
    }), 
  ); 
 
  // Global response transformation 
  app.useGlobalInterceptors(new TransformInterceptor()); 
 
  // Global exception filter 
  app.useGlobalFilters(new HttpExceptionFilter()); 
 
  // Swagger documentation 
  const config = new DocumentBuilder() 
    .setTitle('School ERP API') 
    .setDescription('Complete School Management System API Documentation') 
    .setVersion('1.0') 
    .addBearerAuth( 
      { 
        type: 'http', 
        scheme: 'bearer', 
        bearerFormat: 'JWT', 
        name: 'JWT', 
        description: 'Enter JWT token', 
        in: 'header', 
      }, 
      'JWT-auth', 
    ) 
    .addTag('Authentication', 'User authentication and authorization') 
    .addTag('Students', 'Student management operations') 
    .addTag('Attendance', 'Attendance tracking') 
    .addTag('Examinations', 'Exam and grading management') 
    .addTag('Finance', 'Fee and payment management') 
    .addTag('Library', 'Library management') 
    .addTag('Payroll', 'HR and payroll management') 
    .addTag('Reports', 'Analytics and reports') 
    .build(); 
 
  const document = SwaggerModule.createDocument(app, config); 
  SwaggerModule.setup('api/docs', app, document, { 
    swaggerOptions: { 
      persistAuthorization: true, 
      tagsSorter: 'alpha', 
      operationsSorter: 'alpha', 
    }, 
}); 
await app.listen(port); 
Logger.log('Bootstrap'); 
Logger.log('Bootstrap'); 
} 
bootstrap(); 