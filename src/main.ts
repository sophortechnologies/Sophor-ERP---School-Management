
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //  CORS (Frontend + Swagger friendly)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://localhost:5190',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  //  Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  //  Static assets & views
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // ======================================
  // SWAGGER CONFIGURATION (FIXED)
  // ======================================
  const config = new DocumentBuilder()
    .setTitle('School ERP – Management System API')
    .setDescription(
      `
🎓 **School ERP Management System API**

### Authentication
- JWT Bearer Authentication
- Login once → token applied everywhere

### Usage
1. Call **POST /auth/login**
2. Swagger auto-saves JWT
3. Test all secured endpoints instantly
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //  Swagger UI: http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(` Application running: http://localhost:${port}`);
  console.log(` Swagger UI:          http://localhost:${port}/docs`);
  console.log(` Swagger JSON:        http://localhost:${port}/docs-json`);
}

bootstrap();
