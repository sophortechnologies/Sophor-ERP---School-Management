# School ERP Management System 

Enterprise-grade School Management System Backend API built with NestJS, PostgreSQL, and Prisma.

##  Features

- **Authentication & Authorization** - JWT-based auth with role-based access
- **User Management** - Complete CRUD operations with role assignment  
- **Module Permissions** - Flexible permission system
- **RESTful API** - Clean, documented API endpoints
- **PostgreSQL** - Robust database with Prisma ORM
- **Rate Limiting** - Protection against abuse
- **Swagger Documentation** - Interactive API docs

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Render.com

##  Installation

\\\ash
# Clone repository
git clone https://github.com/your-username/school-erp-backend.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Database setup
npx prisma generate
npx prisma db push

# Start development
npm run start:dev
\\\

##  API Documentation

Once running, visit: \http://localhost:5000/api/v1/docs\

##  Deployment

### Render.com
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Environment Variables
See \.env.example\ for required variables.

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/login | User login |
| GET | /api/v1/auth/profile | Get user profile |
| GET | /api/v1/users | Get all users (Admin) |

##  Contributing

1. Fork the project
2. Create your feature branch (\git checkout -b feature/AmazingFeature\)
3. Commit your changes (\git commit -m 'Add some AmazingFeature'\)
4. Push to the branch (\git push origin feature/AmazingFeature\)
5. Open a Pull Request

