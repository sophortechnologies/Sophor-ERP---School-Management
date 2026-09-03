/**
 * E2E Test: Full Payroll Flow
 *
 * Tests the complete payroll lifecycle:
 *   1.  Admin logs in  → JWT
 *   2.  Admin generates payroll run for month/year
 *   3.  Admin fetches payroll records for the run
 *   4.  Admin approves the payroll run
 *   5.  Admin re-fetches run records (status should be APPROVED)
 *   6.  Admin generates a payslip PDF for a record
 *   7.  Admin gets payroll analytics dashboard
 *   8.  Admin calculates Ethiopian income tax
 *   9.  Duplicate payroll run is rejected (same month/year)
 *  10.  Approving an already-approved run is rejected
 *  11.  Unauthenticated requests are rejected
 *
 * Full AppModule is booted with PrismaService replaced by a
 * stateful in-memory mock — no live DB required.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import * as bcrypt from 'bcrypt';

// ─── In-memory store ──────────────────────────────────────────────────────────
const adminHash = bcrypt.hashSync('Admin123!', 10);

const store = {
  users: [
    {
      id: 1,
      email: 'admin@school.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: adminHash,
      roleId: 1,
      isActive: true,
      passwordExpiresAt: null,
      phone: '',
      role: {
        id: 1, name: 'ADMIN', code: 'ADMIN', isSystem: true,
        RolePermission: [],
      },
    },
  ] as any[],

  sessions: [] as any[],
  auditLogs: [] as any[],

  employees: [
    {
      id: 1,
      employeeCode: 'EMP001',
      status: 'ACTIVE',
      userId: 10,
      user: { id: 10, firstName: 'Abebe', lastName: 'Kebede', email: 'abebe@school.com' },
      salaryStructure: {
        id: 1,
        basePay: { toNumber: () => 20000 },
        components: [
          { type: 'EARNING',    calculationType: 'FIXED',                value: { toNumber: () => 3000 }, name: 'Housing' },
          { type: 'DEDUCTION',  calculationType: 'PERCENTAGE_OF_BASIC',  value: { toNumber: () => 5 },    name: 'Other' },
        ],
      },
    },
  ] as any[],

  payrollRuns: [] as any[],
  payrollRecords: [] as any[],

  employeeAttendance: [] as any[],
  employeeLeave: [] as any[],

  roles: [
    { id: 1, name: 'ADMIN', code: 'ADMIN', isSystem: true },
    { id: 4, name: 'STUDENT', code: 'STUDENT', isSystem: false },
  ] as any[],
};

// ─── Prisma mock factory ──────────────────────────────────────────────────────
const buildPrismaMock = () => {
  const mock: any = {
    // ── User ──────────────────────────────────────────────────────────────
    user: {
      findFirst: jest.fn(({ where }: any) =>
        Promise.resolve(
          store.users.find(u => {
            if (!u.isActive) return false;
            if (where.email) return u.email === where.email;
            if (where.username) return u.username === where.username;
            if (where.OR) return where.OR.some((c: any) =>
              (c.email && u.email === c.email) ||
              (c.username && u.username === c.username),
            );
            return false;
          }) ?? null,
        ),
      ),
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(store.users.find(u => u.id === where.id) ?? null),
      ),
      update: jest.fn(({ where, data }: any) => {
        const u = store.users.find(u => u.id === where.id);
        if (u) Object.assign(u, data);
        return Promise.resolve(u);
      }),
    },

    // ── UserSession ────────────────────────────────────────────────────────
    userSession: {
      create: jest.fn(({ data }: any) => {
        const s = { id: store.sessions.length + 1, ...data };
        store.sessions.push(s);
        return Promise.resolve(s);
      }),
      findMany: jest.fn(({ where }: any) =>
        Promise.resolve(store.sessions.filter(s => s.userId === where?.userId && s.isActive)),
      ),
      updateMany: jest.fn(() => Promise.resolve({ count: 1 })),
    },

    // ── Role ──────────────────────────────────────────────────────────────
    role: {
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(store.roles.find(r => r.id === where.id || r.name === where.name) ?? null),
      ),
      findFirst: jest.fn(({ where }: any) =>
        Promise.resolve(store.roles.find(r => (!where?.name || r.name === where.name)) ?? null),
      ),
    },

    // ── AuditLog ──────────────────────────────────────────────────────────
    auditLog: {
      create: jest.fn(({ data }: any) => {
        const l = { id: store.auditLogs.length + 1, ...data };
        store.auditLogs.push(l);
        return Promise.resolve(l);
      }),
    },

    // ── Employee ──────────────────────────────────────────────────────────
    employee: {
      findMany: jest.fn(() => Promise.resolve(store.employees)),
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(store.employees.find(e => e.id === where.id) ?? null),
      ),
    },

    // ── EmployeeAttendance ────────────────────────────────────────────────
    employeeAttendance: {
      findMany: jest.fn(() => Promise.resolve(store.employeeAttendance)),
    },

    // ── EmployeeLeave ─────────────────────────────────────────────────────
    employeeLeave: {
      findMany: jest.fn(() => Promise.resolve(store.employeeLeave)),
    },

    // ── PayrollRun ────────────────────────────────────────────────────────
    payrollRun: {
      findFirst: jest.fn(({ where }: any) =>
        Promise.resolve(
          store.payrollRuns.find(r =>
            r.month === where.month &&
            r.year === where.year &&
            (!where.status?.not || r.status !== where.status.not),
          ) ?? null,
        ),
      ),
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(store.payrollRuns.find(r => r.id === where.id) ?? null),
      ),
      create: jest.fn(({ data }: any) => {
        const run = { id: store.payrollRuns.length + 1, totalNetPay: 0, ...data };
        store.payrollRuns.push(run);
        return Promise.resolve(run);
      }),
      update: jest.fn(({ where, data }: any) => {
        const run = store.payrollRuns.find(r => r.id === where.id);
        if (run) Object.assign(run, data);
        return Promise.resolve(run);
      }),
    },

    // ── PayrollRecord ─────────────────────────────────────────────────────
    payrollRecord: {
      create: jest.fn(({ data }: any) => {
        const rec = {
          id: store.payrollRecords.length + 1,
          netPay: { toNumber: () => data.netPay },
          ...data,
        };
        store.payrollRecords.push(rec);
        return Promise.resolve(rec);
      }),
      findMany: jest.fn(({ where }: any) =>
        Promise.resolve(
          store.payrollRecords
            .filter(r => r.payrollRunId === where.payrollRunId)
            .map(r => ({
              ...r,
              employee: store.employees.find(e => e.id === r.employeeId),
            })),
        ),
      ),
      findUnique: jest.fn(({ where }: any) => {
        const rec = store.payrollRecords.find(r => r.id === where.id) ?? null;
        if (!rec) return Promise.resolve(null);
        return Promise.resolve({
          ...rec,
          payrollRun: store.payrollRuns.find(r => r.id === rec.payrollRunId),
          employee: {
            ...store.employees.find(e => e.id === rec.employeeId),
            user: { firstName: 'Abebe', lastName: 'Kebede' },
          },
        });
      }),
    },

    // ── SalaryStructure ───────────────────────────────────────────────────
    salaryStructure: {
      findFirst: jest.fn(({ where }: any) =>
        Promise.resolve(
          store.employees.find(e => e.salaryStructure)?.salaryStructure ?? null,
        ),
      ),
      findUnique: jest.fn(() => Promise.resolve(null)),
    },

    // ── SalaryComponent ───────────────────────────────────────────────────
    salaryComponent: {
      findMany: jest.fn(() => Promise.resolve([])),
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
      update: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
      delete: jest.fn(() => Promise.resolve({ id: 1 })),
      findUnique: jest.fn(() => Promise.resolve({ id: 1 })),
    },

    // ── Budget (used by recordPayrollToBudget) ────────────────────────────
    budget: {
      findFirst: jest.fn(() => Promise.resolve(null)), // no salary budget in test
      update: jest.fn(() => Promise.resolve({})),
    },

    // ── Payroll (legacy staff payroll table) ──────────────────────────────
    payroll: {
      findMany: jest.fn(() => Promise.resolve([])),
      findUnique: jest.fn(() => Promise.resolve(null)),
      findFirst: jest.fn(() => Promise.resolve(null)),
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
      update: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
      count: jest.fn(() => Promise.resolve(0)),
    },

    // ── Payslip (legacy) ──────────────────────────────────────────────────
    payslip: {
      findFirst: jest.fn(() => Promise.resolve(null)),
      findMany: jest.fn(() => Promise.resolve([])),
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
    },

    // ── Staff (legacy) ────────────────────────────────────────────────────
    staff: {
      findMany: jest.fn(() => Promise.resolve([])),
      findUnique: jest.fn(() => Promise.resolve(null)),
    },

    // ── Helpers ───────────────────────────────────────────────────────────
    $transaction: jest.fn(async (cb: any) => {
      if (typeof cb === 'function') return cb(buildPrismaMock());
      return Promise.all(cb);
    }),
    $connect:    jest.fn(() => Promise.resolve()),
    $disconnect: jest.fn(() => Promise.resolve()),
    $queryRaw:   jest.fn(() => Promise.resolve([{ '?column?': 1 }])),
  };

  return mock;
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('Payroll Flow (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let payrollRunId: number;
  let payrollRecordId: number;

  beforeAll(async () => {
    const prisma = buildPrismaMock();

    // Ensure uploads/payslips dir exists so PayslipPDFService doesn't crash
    const payslipsDir = path.join(process.cwd(), 'uploads', 'payslips');
    if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir, { recursive: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Step 1: Admin login ───────────────────────────────────────────────────
  it('Step 1 — Admin logs in and receives a JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@school.com', password: 'Admin123!' })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    adminToken = res.body.access_token;
  });

  // ── Step 2: Generate payroll run ─────────────────────────────────────────
  it('Step 2 — Admin generates payroll run for September 2026', async () => {
    const res = await request(app.getHttpServer())
      .post('/payroll/runs/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ month: 9, year: 2026 })
      .expect(201);

    expect(res.body.payrollRun).toBeDefined();
    expect(res.body.payrollRun.month).toBe(9);
    expect(res.body.payrollRun.year).toBe(2026);
    expect(res.body.payrollRun.status).toBe('DRAFT');
    expect(res.body.records).toBeGreaterThanOrEqual(1);

    payrollRunId = res.body.payrollRun.id;
  });

  // ── Step 3: Fetch payroll records ─────────────────────────────────────────
  it('Step 3 — Admin fetches payroll records for the run', async () => {
    const res = await request(app.getHttpServer())
      .get(`/payroll/runs/${payrollRunId}/records`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('employeeId');
    expect(res.body[0]).toHaveProperty('netPay');

    payrollRecordId = res.body[0].id;
  });

  // ── Step 4: Approve the payroll run ──────────────────────────────────────
  it('Step 4 — Admin approves the payroll run', async () => {
    const res = await request(app.getHttpServer())
      .post(`/payroll/runs/${payrollRunId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.status).toBe('APPROVED');
    expect(res.body.approvedBy).toBeDefined();
    expect(res.body.approvedAt).toBeDefined();

    // Verify in store
    const run = store.payrollRuns.find(r => r.id === payrollRunId);
    expect(run?.status).toBe('APPROVED');
  });

  // ── Step 5: Analytics dashboard ──────────────────────────────────────────
  it('Step 5 — Admin views payroll analytics dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/payroll/dashboard/analytics')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toBeDefined();
  });

  // ── Step 6: Ethiopian tax calculation ────────────────────────────────────
  it('Step 6 — Admin calculates Ethiopian income tax for 20000 ETB', async () => {
    const res = await request(app.getHttpServer())
      .post('/payroll/calculate-tax')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ grossSalary: 20000 })
      .expect(201);

    expect(res.body.grossSalary).toBe(20000);
    expect(res.body.incomeTax).toBeGreaterThan(0);
    expect(res.body.employeePension).toBeGreaterThan(0);
    expect(res.body.employerPension).toBeGreaterThan(0);
  });

  // ── Step 7: Tax calculation boundary — below 600 ETB is tax-free ─────────
  it('Step 7 — Salary below 600 ETB has zero income tax', async () => {
    const res = await request(app.getHttpServer())
      .post('/payroll/calculate-tax')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ grossSalary: 500 })
      .expect(201);

    expect(res.body.grossSalary).toBe(500);
    expect(res.body.incomeTax).toBe(0);
  });

  // ── Step 8: Get all payrolls (legacy list) ────────────────────────────────
  it('Step 8 — Admin fetches all payrolls', async () => {
    const res = await request(app.getHttpServer())
      .get('/payroll')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // ── Step 9: Duplicate run rejected ────────────────────────────────────────
  it('Step 9 — Generating a payroll run for the same month/year is rejected', async () => {
    // The store now contains a run for 9/2026 — generating again must fail
    const res = await request(app.getHttpServer())
      .post('/payroll/runs/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ month: 9, year: 2026 })
      .expect(400);

    expect(res.body.message).toContain('already exists');
  });

  // ── Step 10: Approving an already-approved run is rejected ────────────────
  it('Step 10 — Approving an already-approved payroll run is rejected', async () => {
    const res = await request(app.getHttpServer())
      .post(`/payroll/runs/${payrollRunId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(res.body.message).toContain('Cannot approve payroll in status');
  });

  // ── Step 11: Unauthenticated access is rejected ───────────────────────────
  it('Step 11 — Unauthenticated requests to payroll endpoints return 401', async () => {
    await request(app.getHttpServer())
      .get('/payroll')
      .expect(401);

    await request(app.getHttpServer())
      .post('/payroll/runs/generate')
      .send({ month: 10, year: 2026 })
      .expect(401);
  });

  // ── Step 12: Bank file — invalid bank name returns 400 ───────────────────
  it('Step 12 — Invalid bank name for bank file generation returns 400', async () => {
    await request(app.getHttpServer())
      .get(`/payroll/bank-file/${payrollRunId}?bank=INVALID`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  // ── Step 13: Salary component CRUD ───────────────────────────────────────
  it('Step 13 — Admin creates a salary component', async () => {
    const res = await request(app.getHttpServer())
      .post('/payroll/components')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        salaryStructureId: 1,
        name: 'Transport Allowance',
        type: 'EARNING',
        calculationType: 'FIXED',
        value: 1500,
      })
      .expect(201);

    expect(res.body.name).toBe('Transport Allowance');
  });

  // ── Step 14: Verify payroll audit trail ───────────────────────────────────
  it('Step 14 — Login is recorded in audit log', () => {
    const loginLog = store.auditLogs.find(l => l.action === 'LOGIN');
    expect(loginLog).toBeDefined();
    expect(loginLog.userId).toBe(1);
  });
});
