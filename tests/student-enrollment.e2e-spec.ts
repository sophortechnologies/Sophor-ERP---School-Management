/**
 * E2E Test: Full Student Enrollment Flow
 *
 * Tests the complete lifecycle of a student from creation to activation:
 *   1. Admin logs in  → gets JWT
 *   2. Admin creates a student  → student record created, welcome email sent
 *   3. Student activates account  → password set, status → ACTIVE
 *   4. Student logs in  → gets student JWT
 *   5. Student views their own dashboard
 *   6. Admin assigns student to a class
 *   7. Admin retrieves the student record
 *   8. Admin soft-deletes the student (no dependencies)
 *   9. Admin restores the student
 *
 * The real NestJS app (AppModule) is booted with all guards, pipes,
 * throttler, interceptors, and modules active.
 * Only PrismaService is overridden with a stateful in-memory mock so
 * we never need a live database connection.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import * as bcrypt from 'bcrypt';

// ─── Stateful in-memory store ─────────────────────────────────────────────────
// Mirrors the DB tables we touch so each operation sees the result of the last.

const adminHash = bcrypt.hashSync('Admin123!', 10);
const studentHash = bcrypt.hashSync('Student@2026!', 10);

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
      profileImage: null,
      phone: '',
      role: {
        id: 1, name: 'ADMIN', code: 'ADMIN', isSystem: true,
        RolePermission: [],
      },
    },
  ] as any[],

  students: [] as any[],
  sessions: [] as any[],
  auditLogs: [] as any[],
  roles: [
    { id: 1, name: 'ADMIN',   code: 'ADMIN',   isSystem: true,  description: 'Admin' },
    { id: 2, name: 'TEACHER', code: 'TEACHER', isSystem: false, description: 'Teacher' },
    { id: 4, name: 'STUDENT', code: 'STUDENT', isSystem: false, description: 'Student' },
  ] as any[],
  academicSessions: [
    { id: 1, name: '2025-2026', isActive: true, startDate: new Date('2025-09-01'), endDate: new Date('2026-07-31') },
  ] as any[],
  classes: [
    { id: 1, name: 'Grade 5', academicSessionId: 1, Section: [{ id: 1, name: 'A', capacity: 30 }] },
  ] as any[],
  admissionTests: [] as any[],
};

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const buildPrismaMock = () => ({
  user: {
    findFirst: jest.fn(({ where }: any) => {
      return Promise.resolve(
        store.users.find(u => {
          if (!u.isActive) return false;
          if (where.email) return u.email === where.email;
          if (where.username) return u.username === where.username;
          if (where.OR) return where.OR.some((cond: any) =>
            (cond.email && u.email === cond.email) ||
            (cond.username && u.username === cond.username),
          );
          return false;
        }) ?? null,
      );
    }),
    findUnique: jest.fn(({ where }: any) => {
      return Promise.resolve(
        store.users.find(u =>
          (where.id && u.id === where.id) ||
          (where.email && u.email === where.email),
        ) ?? null,
      );
    }),
    create: jest.fn(({ data }: any) => {
      const newUser = { id: store.users.length + 1, isActive: true, ...data };
      store.users.push(newUser);
      return Promise.resolve(newUser);
    }),
    update: jest.fn(({ where, data }: any) => {
      const user = store.users.find(u => u.id === where.id);
      if (user) Object.assign(user, data);
      return Promise.resolve(user);
    }),
  },

  student: {
    findUnique: jest.fn(({ where }: any) => {
      const s = store.students.find(s =>
        (where.id && s.id === where.id) ||
        (where.studentId && s.studentId === where.studentId),
      ) ?? null;
      if (s) {
        return Promise.resolve({
          ...s,
          user: store.users.find(u => u.id === s.userId) ?? null,
        });
      }
      return Promise.resolve(null);
    }),
    findFirst: jest.fn(({ where, orderBy, select }: any) => {
      // Used by generateStudentId to find last studentId
      if (orderBy?.studentId === 'desc') {
        const sorted = [...store.students].sort((a, b) =>
          b.studentId.localeCompare(a.studentId),
        );
        return Promise.resolve(sorted[0] ?? null);
      }
      return Promise.resolve(
        store.students.find(s => {
          if (where?.email) return s.email === where.email;
          if (where?.userId) return s.userId === where.userId;
          return false;
        }) ?? null,
      );
    }),
    findMany: jest.fn(() => Promise.resolve(store.students)),
    create: jest.fn(({ data }: any) => {
      const newStudent = { id: store.students.length + 1, ...data };
      store.students.push(newStudent);
      return Promise.resolve(newStudent);
    }),
    update: jest.fn(({ where, data }: any) => {
      const s = store.students.find(s => s.id === where.id);
      if (s) Object.assign(s, data);
      return Promise.resolve(s);
    }),
    count: jest.fn(() => Promise.resolve(store.students.length)),
  },

  userSession: {
    create: jest.fn(({ data }: any) => {
      const session = { id: store.sessions.length + 1, ...data };
      store.sessions.push(session);
      return Promise.resolve(session);
    }),
    findMany: jest.fn(({ where }: any) =>
      Promise.resolve(
        store.sessions.filter(s => s.userId === where.userId && s.isActive),
      ),
    ),
    updateMany: jest.fn(({ where, data }: any) => {
      store.sessions
        .filter(s => s.userId === where.userId)
        .forEach(s => Object.assign(s, data));
      return Promise.resolve({ count: 1 });
    }),
  },

  role: {
    findUnique: jest.fn(({ where }: any) =>
      Promise.resolve(
        store.roles.find(r =>
          (where.id && r.id === where.id) ||
          (where.name && r.name === where.name) ||
          (where.code && r.code === where.code),
        ) ?? null,
      ),
    ),
    findFirst: jest.fn(({ where }: any) =>
      Promise.resolve(
        store.roles.find(r =>
          (!where.name || r.name === where.name) &&
          (!where.code || r.code === where.code),
        ) ?? null,
      ),
    ),
  },

  academicSession: {
    findUnique: jest.fn(({ where }: any) =>
      Promise.resolve(store.academicSessions.find(s => s.id === where.id) ?? null),
    ),
  },

  class: {
    findUnique: jest.fn(({ where }: any) =>
      Promise.resolve(store.classes.find(c => c.id === where.id) ?? null),
    ),
  },

  auditLog: {
    create: jest.fn(({ data }: any) => {
      const log = { id: store.auditLogs.length + 1, ...data };
      store.auditLogs.push(log);
      return Promise.resolve(log);
    }),
    findMany: jest.fn(() => Promise.resolve(store.auditLogs)),
  },

  examResult: { count: jest.fn(() => Promise.resolve(0)) },
  attendance:  { count: jest.fn(() => Promise.resolve(0)) },
  bill:        { count: jest.fn(() => Promise.resolve(0)) },
  bookIssue:   { count: jest.fn(() => Promise.resolve(0)) },

  studentParent:  { deleteMany: jest.fn(() => Promise.resolve({})) },
  studentDocument: {
    create: jest.fn(({ data }: any) => Promise.resolve({ id: 1, ...data })),
    findMany: jest.fn(() => Promise.resolve([])),
  },

  classAutoAssignmentConfig: {
    findMany: jest.fn(() => Promise.resolve([])),
  },

  $transaction: jest.fn(async (cb: any) => {
    // Build a tx that delegates back to the same mock
    const self = buildPrismaMock();
    if (typeof cb === 'function') return cb(self);
    // Prisma.$transaction([ query1, query2 ]) — execute array of promises
    return Promise.all(cb);
  }),

  $connect:    jest.fn(() => Promise.resolve()),
  $disconnect: jest.fn(() => Promise.resolve()),
  $queryRaw:   jest.fn(() => Promise.resolve([{ '?column?': 1 }])),
});

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('Student Enrollment Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  // Tokens captured during the test flow
  let adminToken: string;
  let studentToken: string;
  let createdStudentId: number;
  const studentUserId = 2; // will be user id 2 after admin is user 1

  beforeAll(async () => {
    prisma = buildPrismaMock();

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
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.access_token;
  });

  // ── Step 2: Admin creates a student ──────────────────────────────────────
  it('Step 2 — Admin creates a new student', async () => {
    const payload = {
      firstName: 'Sara',
      lastName: 'Tekle',
      email: 'sara@student.com',
      phone: '0911111111',
      gender: 'FEMALE',
      dateOfBirth: '2010-05-15',
      address: 'Addis Ababa',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      pincode: '1000',
      nationality: 'Ethiopian',
      guardianName: 'Marta Tekle',
      guardianPhone: '0922222222',
      guardianRelation: 'MOTHER',
      sessionId: 1,
      termsAccepted: true,
    };

    const res = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.firstName).toBe('Sara');
    expect(res.body.studentId).toMatch(/^STU\d{8}$/);
    createdStudentId = res.body.id;
  });

  // ── Step 3: Student activates account ────────────────────────────────────
  it('Step 3 — Student activates account via email link', async () => {
    // Find the generated studentId from the store
    const student = store.students[0];
    expect(student).toBeDefined();

    const res = await request(app.getHttpServer())
      .post(`/students/activate-student/${student.studentId}`)
      .send({ password: 'Student@2026!' })
      .expect(201);

    expect(res.body.message).toContain('activated successfully');

    // Verify student status updated in the store
    expect(store.students[0].status).toBe('ACTIVE');
  });

  // ── Step 4: Student logs in ───────────────────────────────────────────────
  it('Step 4 — Student logs in and receives a JWT', async () => {
    const student = store.students[0];

    const res = await request(app.getHttpServer())
      .post('/students/login')
      .send({ studentId: student.studentId, password: 'Student@2026!' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.message).toBe('Login successful');
    studentToken = res.body.token;
  });

  // ── Step 5: Admin retrieves the student ──────────────────────────────────
  it('Step 5 — Admin retrieves the student by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(createdStudentId);
    expect(res.body.firstName).toBe('Sara');
    expect(res.body.status).toBe('ACTIVE');
  });

  // ── Step 6: Admin assigns student to a class ──────────────────────────────
  it('Step 6 — Admin assigns student to Grade 5 Section A', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/students/${createdStudentId}/assign-class`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ classId: 1, section: 'A' })
      .expect(200);

    expect(res.body.classId).toBe(1);
    expect(res.body.sectionId).toBeDefined();
  });

  // ── Step 7: Admin soft-deletes the student ────────────────────────────────
  it('Step 7 — Admin soft-deletes the student', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toBe('Student deleted successfully');

    // Verify soft delete in store
    expect(store.students[0].status).toBe('DELETED');
    expect(store.students[0].deletedAt).toBeDefined();
  });

  // ── Step 8: Admin restores the student ────────────────────────────────────
  it('Step 8 — Admin restores the deleted student', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/students/${createdStudentId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toBe('Student restored successfully');

    // Verify restore in store
    expect(store.students[0].status).toBe('ACTIVE');
    expect(store.students[0].deletedAt).toBeNull();
  });

  // ── Step 9: Verify audit trail ────────────────────────────────────────────
  it('Step 9 — Audit log contains all enrollment actions', async () => {
    const actions = store.auditLogs.map(l => l.action);

    // Login creates an audit log
    expect(actions).toContain('LOGIN');
    // Student creation creates an audit log
    expect(actions).toContain('STUDENT_CREATED');
    // Delete and restore create audit logs
    expect(actions).toContain('STUDENT_DELETED');
    expect(actions).toContain('STUDENT_RESTORED');
  });

  // ── Step 10: Unauthenticated access is rejected ───────────────────────────
  it('Step 10 — Unauthenticated requests are rejected with 401', async () => {
    await request(app.getHttpServer())
      .get(`/students/${createdStudentId}`)
      .expect(401);
  });

  // ── Step 11: Student search returns the enrolled student ──────────────────
  it('Step 11 — Searching for Sara returns her record', async () => {
    const res = await request(app.getHttpServer())
      .get('/students/search?q=Sara')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // store.students contains Sara
    const found = res.body.find((s: any) => s.firstName === 'Sara');
    expect(found).toBeDefined();
  });
});
