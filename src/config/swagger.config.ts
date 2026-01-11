
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  // -----------------------------
  // Swagger Core Configuration
  // -----------------------------
  const config = new DocumentBuilder()
    .setTitle('ERP School Management System API')
    .setDescription(`
# 🎓 Sophor Technologies – ERP School Management System

A complete, secure, and scalable School ERP API.

## 🔐 Authentication
- JWT Bearer Authentication
- Role-Based Access Control (RBAC)
- Module & Permission-level security

### How to Authenticate
1. Call **POST /auth/login**
2. JWT will be **auto-saved & applied**
3. All secured endpoints become available

✅ No manual token copy–paste required.

---
    `)
    .setVersion('1.0.0')
    .setContact(
      'Sophor Technologies',
      'https://sophor-tech.com',
      'support@sophor-tech.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT Authorization header using Bearer scheme',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:5000', 'Development')
    .addServer('https://your-app.onrender.com', 'Production')
    .build();

  // -----------------------------
  // Create Swagger Document
  // -----------------------------
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controller, method) =>
      `${controller.replace('Controller', '')}_${method}`,
  });

  // -----------------------------
  // Swagger UI Setup
  // -----------------------------
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ERP School Management API Docs',

    // ✅ Auto-capture JWT from login response
    customJs: `
      window.onload = function () {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
          const response = await originalFetch(...args);

          try {
            const cloned = response.clone();
            const json = await cloned.json();

            if (json?.data?.accessToken) {
              window.ui.authActions.authorize({
                "JWT-auth": {
                  name: "JWT",
                  schema: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                  },
                  value: json.data.accessToken
                }
              });
              console.log("✅ Swagger JWT auto-authorized");
            }
          } catch (e) {}

          return response;
        };
      };
    `,

    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info h2 { color: #2563eb; }
      .swagger-ui .btn.authorize {
        background-color: #10b981;
        border-color: #10b981;
        color: #fff;
      }
    `,

    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      validatorUrl: null,
    },
  });
}
