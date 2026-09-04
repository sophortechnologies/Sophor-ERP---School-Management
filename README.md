# Sophor ERP — School Management System

Enterprise-grade backend API for managing school operations, built with **NestJS**, **PostgreSQL**, and **Prisma ORM**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Passport + bcrypt |
| Rate Limiting | @nestjs/throttler |
| Documentation | Swagger / OpenAPI |
| Email | Nodemailer |
| Real-time | Socket.IO (WebSockets) |
| Hosting | Render.com / Neon (DB) |

---

## Modules

| Module | Description |
|---|---|
| Auth | JWT login, register, sessions, password management |
| Users | User CRUD, role assignment, permissions |
| Students | Admissions, enrollment, attendance, documents |
| Teachers | Registration, class/subject assignments |
| Staff | Staff management, attendance, leave |
| Employees | Employee records, payroll, leave |
| Grading | Exams, results, report cards, transcripts |
| Attendance | Student & staff daily attendance with holiday awareness |
| Billing | Fee configuration, bills, payments |
| Payroll | Salary structures, payslip generation, Ethiopian tax |
| Budget | Budget lifecycle, approvals, transfers, alerts |
| Assets | Asset tracking, depreciation, maintenance |
| Timetable | Auto-generate, conflict detection, export |
| Reports | Admin dashboard, attendance, fee, academic reports |
| Notifications | Real-time WebSocket + email notifications |
| Communication | Internal messaging system |
| Calendar | School events and reminders |
| Departments | Department management |
| Academic Sessions | Session management and activation |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local) or [Neon](https://neon.tech) (cloud)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed default roles, permissions, and admin users
npx prisma db seed

# Start development server
npm run start:dev
```

Server runs at `http://localhost:5000`
Swagger UI at `http://localhost:5000/docs`

### Default Accounts (after seed)

| Email | Password | Role |
|---|---|---|
| superadmin@school.com | Admin123! | SUPER_ADMIN |
| admin@school.com | Admin123! | ADMIN |
| teacher@school.com | Teacher123! | TEACHER |

> **Change these passwords immediately after first login.**

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
```

---

## API Reference

Full interactive documentation available at `/docs` when the server is running.

### Key Endpoints

```
POST   /auth/login                  Student / staff login
POST   /auth/register               Register new user
GET    /auth/profile                Get current user profile
POST   /students                    Create student admission
GET    /students                    List students (paginated)
GET    /grading/exams               List exams
POST   /grading/grades/bulk         Bulk enter grades
GET    /grading/reports/exams/:id   Get class report cards
POST   /billing/bills               Create a bill
POST   /billing/payments            Record a payment
GET    /payroll/dashboard/analytics Payroll analytics
POST   /payroll/runs/generate       Generate payroll run
GET    /reports/admin/dashboard     Admin dashboard
```

---

## Testing

```bash
# Run all unit and integration tests
npm test

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

**175 tests passing** across auth, students, grading, and billing modules.

---

## Deployment

### Render.com

1. Connect your GitHub repository
2. Set all environment variables in the Render dashboard
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm run start:prod`

---

## License

Proprietary — Sophor Technologies © 2026
