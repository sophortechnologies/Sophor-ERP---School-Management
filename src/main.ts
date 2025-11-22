
// // import { NestFactory } from '@nestjs/core';
// // import { AppModule } from './app.module';
// // import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// // import { ValidationPipe } from '@nestjs/common';
// // import { NestExpressApplication } from '@nestjs/platform-express';
// // import { join } from 'path';

// // async function bootstrap() {
// //   const app = await NestFactory.create<NestExpressApplication>(AppModule);

// //   // Enable CORS
// //   app.enableCors({
// //     origin: true,
// //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
// //     credentials: true,
// //   });

// //   // Global validation pipe
// //   app.useGlobalPipes(new ValidationPipe({
// //     whitelist: true,
// //     transform: true,
// //     forbidNonWhitelisted: true,
// //   }));

// //   // Static files serving
// //   app.useStaticAssets(join(__dirname, '..', 'public'));
// //   app.setBaseViewsDir(join(__dirname, '..', 'views'));
// //   app.setViewEngine('hbs');

// //   // Comprehensive Swagger Configuration
// //   const config = new DocumentBuilder()
// //     .setTitle('Sophor ERP - School Management System')
// //     .setDescription(`
// // # Complete School Management System API Documentation

// // ##  System Overview
// // Comprehensive ERP system for school management including student administration, attendance, fees, academics, and more.

// // ## API Modules

// // ### 1. **Authentication & Authorization** (\`/auth\`)
// // - User login with username/password, JWT token management
// // - Password management and session control
// // - Role-based access control

// // ### 2. **User Management** (\`/users\`)
// // - User CRUD operations
// // - Profile management
// // - User role assignments

// // ### 3. **Module & Permission System** (\`/modules\`)
// // - Dynamic module management
// // - Role-based permissions
// // - System module configuration

// // ### 4. **Academic Sessions** (\`/academic-sessions\`)
// // - Academic year/session management
// // - Active session configuration
// // - Session-based student enrollment

// // ### 5. **Student Management** (\`/students\`)
// // -  **Student admission and registration**
// // -  **Document upload and management**
// // -  **Automatic student ID generation**
// // -  **Admission form PDF generation**
// // -  **Academic session integration**
// // - Student records management
// // - Bulk operations and statistics

// // ### 6. **Attendance Management** (Upcoming)
// // - Student and staff attendance
// // - Daily records and reports
// // - Leave management

// // ### 7. **Fee Management** (Upcoming)
// // - Fee structure setup
// // - Payment processing
// // - Receipt generation

// // ### 8. **Examination System** (Upcoming)
// // - Exam scheduling
// // - Marks entry and report cards
// // - Grade management

// // ### 9. **Inventory Management** (Upcoming)
// // - School assets tracking
// // - Library management
// // - Resource allocation

// // ### 10. **Reporting & Analytics** (Upcoming)
// // - Comprehensive reports
// // - Dashboard analytics
// // - Statistical data

// // ##  Authentication
// // This API uses JWT Bearer token authentication. Include the token in the Authorization header:
// // \`\`\`
// // Authorization: Bearer <your-jwt-token>
// // \`\`\`

// // **Login Credentials:**
// // - Use username and password for authentication
// // - Username can be email, phone number, or custom username

// // ##  New Features Available

// // ###  Academic Sessions Management
// // - Create and manage academic years
// // - Set active sessions for student enrollment
// // - Session-based data organization

// // ### 🎓 Enhanced Student Admission
// // - **Complete admission workflow** with validation
// // - **Document upload** (ID proofs, transcripts, photos)
// // - **Automatic student ID generation** (STU240001 format)
// // - **PDF admission forms** and confirmation receipts
// // - **Academic session integration**
// // - **Guardian information management**
// // - **Admission audit trails**

// // ###  Document Management
// // - Upload student documents (max 5MB)
// // - Support for multiple document types:
// //   - ID Proof, Birth Certificate, Transcripts
// //   - Photos, Medical Records
// // - File validation and security

// // ##  Testing Endpoints
// // - Health Check: \`GET /auth/health\`
// // - API Status: \`GET /status\`
// // - Database Status: Check application logs

// // ##  Quick Start
// // 1. **Configure Academic Session:**
// //    \`\`\`bash
// //    POST /academic-sessions
// //    {
// //      "name": "2024-2025 Academic Year",
// //      "startDate": "2024-09-01", 
// //      "endDate": "2025-06-30",
// //      "isActive": true
// //    }
// //    \`\`\`

// // 2. **Admit New Student:**
// //    \`\`\`bash
// //    POST /students/admission
// //    {
// //      "firstName": "John",
// //      "lastName": "Doe",
// //      "guardianName": "Jane Doe",
// //      "guardianRelation": "Mother", 
// //      "guardianPhone": "+1234567890",
// //      "dateOfBirth": "2015-03-15",
// //      "gender": "Male",
// //      "email": "john.doe@school.com"
// //    }
// //    \`\`\`

// // 3. **Upload Student Documents:**
// //    \`\`\`bash
// //    POST /students/{id}/documents
// //    FormData: file + documentType
// //    \`\`\`

// // 4. **Generate Admission Forms:**
// //    \`\`\`bash
// //    GET /students/{id}/admission-form (PDF)
// //    GET /students/{id}/confirmation-receipt (PDF)
// //    \`\`\`

// // ##  Student Admission Flow
// // 1. Configure active academic session
// // 2. Create student admission with guardian details  
// // 3. Upload required documents
// // 4. Generate and print admission forms
// // 5. Track admission audit history

// // ---
// // *For more details, explore each module's endpoints below.*
// // *Student Admission Module: 100% Complete *
// //     `)
// //     .setVersion('2.1.0')
// //     .setContact(
// //       'Sophor Technologies',
// //       'https://sophortechnologies.com/',
// //       'support@sophortechnologies.com'
// //     )
// //     .setLicense('Sophor License', 'https://opensource.org/licenses/Sophor')
// //     .addBearerAuth(
// //       {
// //         type: 'http',
// //         scheme: 'bearer',
// //         bearerFormat: 'JWT',
// //         name: 'JWT',
// //         description: 'Enter JWT token obtained from /auth/login',
// //         in: 'header',
// //       },
// //       'JWT-auth',
// //     )
// //     .addTag('Authentication', 'User login with username/password and token management')
// //     .addTag('Users', 'User management and profile operations')
// //     .addTag('Modules', 'System modules and permission management')
// //     .addTag('Academic Sessions', 'Academic year and session management')
// //     .addTag('Students', 'Complete student admission and management system')
// //     .addTag('Attendance', 'Student and staff attendance tracking')
// //     .addTag('Fees', 'Fee management and payment processing')
// //     .addTag('Academics', 'Academic classes, subjects, and timetable')
// //     .addTag('Examinations', 'Exam management and results')
// //     .addTag('Inventory', 'School assets and library management')
// //     .addTag('Reports', 'Analytics and reporting system')
// //     .build();

// //   const document = SwaggerModule.createDocument(app, config);
  
// //   // Enhanced Swagger UI setup
// //   SwaggerModule.setup('api', app, document, {
// //     customSiteTitle: 'Sophor ERP - API Documentation',
// //     customfavIcon: 'https://sophortechnologies.com/favicon.ico',
// //     customCss: `
// //       .swagger-ui .topbar { display: none; }
// //       .swagger-ui .info hgroup.main h2 { color: #2563eb; }
// //       .swagger-ui .btn.authorize { background-color: #2563eb; }
// //       .description pre { background: #f8fafc; padding: 15px; border-radius: 5px; }
// //       .swagger-ui .tag { margin: 0 5px 5px 0; }
// //       .swagger-ui .opblock-tag { font-size: 18px; font-weight: 600; }
// //     `,
// //     swaggerOptions: {
// //       persistAuthorization: true,
// //       docExpansion: 'none',
// //       filter: true,
// //       showRequestDuration: true,
// //       operationsSorter: 'alpha',
// //       tagsSorter: 'alpha',
// //       validatorUrl: null,
// //       apisSorter: 'alpha',
// //       defaultModelsExpandDepth: 2,
// //       defaultModelExpandDepth: 2,
// //     },
// //   });

// //   // Global prefix commented out - endpoints will be at root level
// //   // app.setGlobalPrefix('v1');

// //   const port = process.env.PORT || 5000;
// //   await app.listen(port);
  
// //   console.log(`\n Application is running on: http://localhost:${port}`);
// //   console.log(`  Swagger API Documentation: http://localhost:${port}/api`);
// //   console.log(`  Health Check: http://localhost:${port}/status`);
// //   console.log(` Auth Health: http://localhost:${port}/auth/health`);
  
// //   console.log(`\n Available API Modules:`);
// //   console.log(`   • Authentication: http://localhost:${port}/auth`);
// //   console.log(`   • User Management: http://localhost:${port}/users`);
// //   console.log(`   • Module System: http://localhost:${port}/modules`);
// //   console.log(`   • Academic Sessions: http://localhost:${port}/academic-sessions`);
// //   console.log(`   • Student Management: http://localhost:${port}/students`);
  
// //   console.log(`\n🎓 New Student Admission Features:`);
// //   console.log(`    Complete admission workflow`);
// //   console.log(`    Document upload & management`);
// //   console.log(`   PDF form generation`);
// //   console.log(`   Academic session integration`);
// //   console.log(`   Automatic ID generation`);
  
// //   console.log(`\ Login with username/password at: http://localhost:${port}/auth/login`);
// //   console.log(` Tip: Use Swagger UI to test all endpoints interactively`);
// //   console.log(`\n Quick Start:`);
// //   console.log(`   1. Configure academic session first`);
// //   console.log(`   2. Then admit students with guardian details`);
// //   console.log(`   3. Upload documents and generate forms`);
// // }

// // bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   // Enable CORS
//   app.enableCors({
//     origin: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//   });

//   // Global validation pipe
//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true,
//     transform: true,
//     forbidNonWhitelisted: true,
//   }));

//   // Static files serving
//   app.useStaticAssets(join(__dirname, '..', 'public'));
//   app.setBaseViewsDir(join(__dirname, '..', 'views'));
//   app.setViewEngine('hbs');

//   // Comprehensive Swagger Configuration
//   const config = new DocumentBuilder()
//     .setTitle('Sophor ERP - School Management System')
//     .setDescription(`
// # Complete School Management System API Documentation

// ##  System Overview
// Comprehensive ERP system for school management including student administration, attendance, fees, academics, and more.

// ## API Modules

// ### 1. **Authentication & Authorization** (\`/auth\`)
// - User login with username/password, JWT token management
// - Password management and session control
// - Role-based access control

// ### 2. **User Management** (\`/users\`)
// - User CRUD operations
// - Profile management
// - User role assignments

// ### 3. **Module & Permission System** (\`/modules\`)
// - Dynamic module management
// - Role-based permissions
// - System module configuration

// ### 4. **Academic Sessions** (\`/academic-sessions\`)
// - Academic year/session management
// - Active session configuration
// - Session-based student enrollment

// ### 5. **Student Management** (\`/students\`) - **COMPLETE MODULE**
// ####  Core Features:
// - **Student Admission & Registration** - Complete workflow
// - **Document Management** - Upload and manage student documents
// - **Automatic ID Generation** - Unique student and admission numbers
// - **Academic Integration** - Class and session management
// - **Guardian Information** - Complete guardian details management

// ####  Admission Workflow:
// 1. **Pre-Admission Validation** - Data validation and duplicate checks
// 2. **Automatic ID Generation** - STU240001 format student IDs
// 3. **User Account Creation** - Automatic student portal accounts
// 4. **Document Management** - Upload photos, certificates, proofs
// 5. **Admission Confirmation** - PDF forms and receipts
// 6. **Audit Trail** - Complete admission history tracking

// ####  Key Endpoints:
// - \`POST /students\` - Create new student admission
// - \`POST /students/bulk\` - Bulk student admission
// - \`GET /students\` - Get all students with filtering
// - \`GET /students/stats\` - Admission statistics
// - \`GET /students/:id\` - Get student with full details
// - \`GET /students/student-id/:studentId\` - Find by student ID
// - \`PATCH /students/:id\` - Update student information
// - \`PATCH /students/:id/status\` - Change student status
// - \`POST /students/:id/generate-confirmation\` - Generate admission confirmation
// - \`GET /students/:id/admission-history\` - Get admission audit trail
// - \`DELETE /students/:id\` - Delete student record

// ####  Advanced Features:
// - **Bulk Admission** - Import multiple students at once
// - **Admission Statistics** - Real-time admission analytics
// - **Status Management** - Active, Inactive, Graduated statuses
// - **Class Assignment** - Automatic and manual class assignment
// - **Fee Integration** - Ready for fee management integration
// - **Attendance Ready** - Prepared for attendance tracking

// ### 6. **Attendance Management** (Upcoming)
// - Student and staff attendance
// - Daily records and reports
// - Leave management

// ### 7. **Fee Management** (Upcoming)
// - Fee structure setup
// - Payment processing
// - Receipt generation

// ### 8. **Examination System** (Upcoming)
// - Exam scheduling
// - Marks entry and report cards
// - Grade management

// ### 9. **Inventory Management** (Upcoming)
// - School assets tracking
// - Library management
// - Resource allocation

// ### 10. **Reporting & Analytics** (Upcoming)
// - Comprehensive reports
// - Dashboard analytics
// - Statistical data

// ##  Authentication
// This API uses JWT Bearer token authentication. Include the token in the Authorization header:
// \`\`\`
// Authorization: Bearer <your-jwt-token>
// \`\`\`

// **Required Roles for Student Module:**
// - **ADMIN**: Full access to all student operations
// - **REGISTRAR**: Student admission and management
// - **TEACHER**: Read-only access to student information
// - **STUDENT**: Access to own profile only

// ##  Student Admission Data Structure

// ### Personal Information:
// - First name, Last name, Date of birth, Gender
// - Blood group, Nationality, Religion, Category

// ### Contact Information:
// - Email, Phone, Address, City, State, Pincode

// ### Guardian Information:
// - Guardian name, Relation, Contact details
// - Occupation, Income, Emergency contact

// ### Academic Information:
// - Previous school, Class, Percentage
// - Transfer certificate details

// ### Health Information:
// - Medical conditions, Allergies, Emergency contacts

// ### Document Management:
// - Photo, Birth certificate, Transfer certificate
// - ID proof, Transcripts, Medical certificates

// ##  Quick Start Guide

// ### 1. Configure Academic Session First:
// \`\`\`bash
// POST /academic-sessions
// {
//   "name": "2024-2025 Academic Year",
//   "startDate": "2024-09-01",
//   "endDate": "2025-06-30", 
//   "isActive": true
// }
// \`\`\`

// ### 2. Admit New Student:
// \`\`\`bash
// POST /students
// {
//   "firstName": "John",
//   "lastName": "Doe",
//   "dateOfBirth": "2015-03-15",
//   "gender": "Male",
//   "email": "john.doe@school.com",
//   "phone": "+1234567890",
//   "guardianName": "Jane Doe",
//   "guardianRelation": "Mother",
//   "guardianPhone": "+1234567890",
//   "classId": "class-uuid",
//   "sessionId": "session-uuid"
// }
// \`\`\`

// ### 3. Bulk Student Admission:
// \`\`\`bash
// POST /students/bulk
// {
//   "students": [
//     {
//       "firstName": "Student1",
//       "lastName": "Last1",
//       "dateOfBirth": "2015-01-01",
//       "gender": "Male",
//       "classId": "class-uuid", 
//       "sessionId": "session-uuid"
//     },
//     {
//       "firstName": "Student2", 
//       "lastName": "Last2",
//       "dateOfBirth": "2015-02-01",
//       "gender": "Female",
//       "classId": "class-uuid",
//       "sessionId": "session-uuid"
//     }
//   ]
// }
// \`\`\`

// ### 4. Get Admission Statistics:
// \`\`\`bash
// GET /students/stats?sessionId=session-uuid
// \`\`\`

// ##  Response Examples

// ### Student Admission Success:
// \`\`\`json
// {
//   "id": "student-uuid",
//   "studentId": "STU240001",
//   "admissionNumber": "ADM20240001", 
//   "firstName": "John",
//   "lastName": "Doe",
//   "email": "john.doe@school.com",
//   "status": "Active",
//   "admissionDate": "2024-01-15T10:30:00.000Z",
//   "confirmationNumber": "CONF1705309812345"
// }
// \`\`\`

// ### Admission Statistics:
// \`\`\`json
// {
//   "totalApplications": 150,
//   "approvedApplications": 120,
//   "pendingApplications": 25,
//   "rejectedApplications": 5,
//   "applicationsByClass": [
//     {"className": "Grade 1", "count": 45},
//     {"className": "Grade 2", "count": 38}
//   ],
//   "applicationsByMonth": [
//     {"month": "Jan 2024", "count": 25},
//     {"month": "Feb 2024", "count": 30}
//   ]
// }
// \`\`\`

// ##  Error Handling

// ### Common Error Codes:
// - \`400\` - Validation errors in admission data
// - \`401\` - Unauthorized (invalid JWT token)
// - \`403\` - Insufficient permissions
// - \`404\` - Student not found
// - \`409\` - Duplicate student (email/phone already exists)
// - \`500\` - Internal server error

// ##  Best Practices

// 1. **Always configure academic sessions first**
// 2. **Validate student data before admission**
// 3. **Use bulk admission for multiple students**
// 4. **Track admission history for audit purposes**
// 5. **Generate confirmation receipts for parents**

// ---
// *Student Management Module: 100% Complete & Production Ready*
// *Last Updated: ${new Date().toISOString().split('T')[0]}*
//     `)
//     .setVersion('2.1.0')
//     .setContact(
//       'Sophor Technologies',
//       'https://sophortechnologies.com/',
//       'support@sophortechnologies.com'
//     )
//     .setLicense('Sophor License', 'https://opensource.org/licenses/Sophor')
//     .addBearerAuth(
//       {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//         name: 'JWT',
//         description: 'Enter JWT token obtained from /auth/login',
//         in: 'header',
//       },
//       'JWT-auth',
//     )
//     .addTag('Authentication', 'User login with username/password and token management')
//     .addTag('Users', 'User management and profile operations')
//     .addTag('Modules', 'System modules and permission management')
//     .addTag('Academic Sessions', 'Academic year and session management')
//     .addTag('Students', 'Complete student admission and management system')
//     .addTag('Attendance', 'Student and staff attendance tracking')
//     .addTag('Fees', 'Fee management and payment processing')
//     .addTag('Academics', 'Academic classes, subjects, and timetable')
//     .addTag('Examinations', 'Exam management and results')
//     .addTag('Inventory', 'School assets and library management')
//     .addTag('Reports', 'Analytics and reporting system')
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
  
//   // Enhanced Swagger UI setup
//   SwaggerModule.setup('api', app, document, {
//     customSiteTitle: 'Sophor ERP - API Documentation',
//     customfavIcon: 'https://sophortechnologies.com/favicon.ico',
//     customCss: `
//       .swagger-ui .topbar { display: none; }
//       .swagger-ui .info hgroup.main h2 { color: #2563eb; }
//       .swagger-ui .btn.authorize { background-color: #2563eb; }
//       .description pre { background: #f8fafc; padding: 15px; border-radius: 5px; }
//       .swagger-ui .tag { margin: 0 5px 5px 0; }
//       .swagger-ui .opblock-tag { font-size: 18px; font-weight: 600; }
//       .student-module { border-left: 4px solid #10b981; padding-left: 15px; background: #f0fdf4; }
//     `,
//     swaggerOptions: {
//       persistAuthorization: true,
//       docExpansion: 'none',
//       filter: true,
//       showRequestDuration: true,
//       operationsSorter: 'alpha',
//       tagsSorter: 'alpha',
//       validatorUrl: null,
//       apisSorter: 'alpha',
//       defaultModelsExpandDepth: 2,
//       defaultModelExpandDepth: 2,
//     },
//   });

//   const port = process.env.PORT || 5000;
//   await app.listen(port);

//   console.log(`\n Application is running on: http://localhost:${port}`);
//   console.log(` Swagger API Documentation: http://localhost:${port}/api`);
//   console.log(`  Health Check: http://localhost:${port}/status`);
//   console.log(` Auth Health: http://localhost:${port}/auth/health`);
  
//   console.log(`\n Available API Modules:`);
//   console.log(`   • Authentication: http://localhost:${port}/auth`);
//   console.log(`   • User Management: http://localhost:${port}/users`);
//   console.log(`   • Module System: http://localhost:${port}/modules`);
//   console.log(`   • Academic Sessions: http://localhost:${port}/academic-sessions`);
//   console.log(`   • Student Management: http://localhost:${port}/students`);
  
//   console.log(`\n🎓 STUDENT MODULE FEATURES:`);
//   console.log(`    Complete admission workflow`);
//   console.log(`    Document upload & management`);
//   console.log(`    PDF form generation`);
//   console.log(`    Academic session integration`);
//   console.log(`    Automatic ID generation`);
//   console.log(`    Bulk student admission`);
//   console.log(`    Admission statistics & analytics`);
//   console.log(`    Role-based access control`);
//   console.log(`    Audit trail & history tracking`);
  
//   console.log(`\n Login with username/password at: http://localhost:${port}/auth/login`);
//   console.log(` Use Swagger UI to test all endpoints interactively`);
  
//   console.log(`\n QUICK START:`);
//   console.log(`   1. Configure academic session first`);
//   console.log(`   2. Admit students with guardian details`);
//   console.log(`   3. Use bulk admission for multiple students`);
//   console.log(`   4. Generate admission confirmations`);
//   console.log(`   5. Track admission statistics`);
  
//   console.log(`\n Student Endpoints Available:`);
//   console.log(`   POST /students - Create student admission`);
//   console.log(`   POST /students/bulk - Bulk admission`);
//   console.log(`   GET /students - List all students`);
//   console.log(`   GET /students/stats - Admission statistics`);
//   console.log(`   GET /students/:id - Get student details`);
//   console.log(`   PATCH /students/:id - Update student`);
//   console.log(`   DELETE /students/:id - Delete student`);
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for production
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-frontend-domain.vercel.app',
    ],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
}
bootstrap();