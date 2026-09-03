// src/modules/reports/reports.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== ADMIN DASHBOARD ====================

  async getAdminDashboard(academicSessionId?: number) {
    const whereSession = academicSessionId ? { sessionId: academicSessionId } : {};

    // Get counts
    const [
      totalStudents,
      totalTeachers,
      totalStaff,
      totalParents,
      activeStudents,
      totalBills,
      totalPayments,
      totalPayrolls,
    ] = await Promise.all([
      this.prisma.student.count({ where: whereSession }),
      this.prisma.teacher.count(),
      this.prisma.staff.count(),
      this.prisma.parent.count(),
      this.prisma.student.count({ where: { status: 'ACTIVE' } }),
      this.prisma.bill.count(),
      this.prisma.payment.count(),
      this.prisma.payroll.count(),
    ]);

    // Monthly attendance trend (last 6 months)
    const attendanceTrend = await this.getAttendanceTrend();

    // Fee collection trend (last 6 months)
    const feeTrend = await this.getFeeTrend();

    // Recent activities
    const recentActivities = await this.getRecentActivities();

    // Upcoming events
    const upcomingEvents = await this.getUpcomingEvents();

    // Top performing students (by exam results)
    const topStudents = await this.getTopPerformingStudents();

    return {
      summary: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalStaff,
        totalParents,
        inactiveRate: totalStudents > 0 
          ? Math.round(((totalStudents - activeStudents) / totalStudents) * 100)
          : 0,
      },
      financial: {
        totalBills,
        totalPayments,
        totalPayrolls,
      },
      trends: {
        attendance: attendanceTrend,
        feeCollection: feeTrend,
      },
      recentActivities,
      upcomingEvents,
      topStudents,
      lastUpdated: new Date(),
    };
  }

  private async getAttendanceTrend() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }

    const trend = [];
    for (const m of months) {
      const totalDays = await this.prisma.attendance.count({
        where: {
          date: { gte: m.startDate, lte: m.endDate },
        },
      });

      const presentDays = await this.prisma.attendance.count({
        where: {
          date: { gte: m.startDate, lte: m.endDate },
          status: 'PRESENT',
        },
      });

      trend.push({
        month: `${m.month} ${m.year}`,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      });
    }
    return trend;
  }

  private async getFeeTrend() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }

    const trend = [];
    for (const m of months) {
      const payments = await this.prisma.payment.aggregate({
        where: {
          paymentDate: { gte: m.startDate, lte: m.endDate },
          status: 'SUCCESS',
        },
        _sum: { amountPaid: true },
      });

      trend.push({
        month: `${m.month} ${m.year}`,
        collected: Number(payments._sum.amountPaid || 0),
      });
    }
    return trend;
  }

  private async getRecentActivities() {
    const activities = [];

    // Recent students
    const recentStudents = await this.prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    for (const student of recentStudents) {
      activities.push({
        type: 'STUDENT_ADDED',
        title: 'New Student Registered',
        description: `${student.firstName} ${student.lastName} was added`,
        timestamp: student.createdAt,
      });
    }

    // Recent payments
    const recentPayments = await this.prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: 'desc' },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    for (const payment of recentPayments) {
      activities.push({
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        description: `${payment.student.firstName} ${payment.student.lastName} paid ${payment.amountPaid}`,
        timestamp: payment.paymentDate,
      });
    }

    // Sort by timestamp desc
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }

  private async getUpcomingEvents() {
    const events = [];

    // Upcoming exams
    const exams = await this.prisma.exam.findMany({
      where: { startDate: { gte: new Date() }, isActive: true },
      take: 5,
      orderBy: { startDate: 'asc' },
      include: { class: true },
    });

    for (const exam of exams) {
      events.push({
        type: 'EXAM',
        title: exam.name,
        description: `Class ${exam.class.name} exam starts on ${exam.startDate.toLocaleDateString()}`,
        date: exam.startDate,
      });
    }

    // Upcoming fee due dates
    const bills = await this.prisma.bill.findMany({
      where: { dueDate: { gte: new Date() }, status: 'UNPAID' },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    for (const bill of bills) {
      events.push({
        type: 'FEE_DUE',
        title: 'Fee Due Date',
        description: `Fee due for ${bill.student.firstName} ${bill.student.lastName}`,
        date: bill.dueDate,
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);
  }

  private async getTopPerformingStudents() {
    const examResults = await this.prisma.examResult.groupBy({
      by: ['studentId'],
      _avg: { percentage: true },
      orderBy: { _avg: { percentage: 'desc' } },
      take: 10,
    });

    const studentIds = examResults.map(r => r.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, firstName: true, lastName: true, studentId: true },
    });

    return examResults.map(result => {
      const student = students.find(s => s.id === result.studentId);
      return {
        studentId: result.studentId,
        studentCode: student?.studentId,
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        averagePercentage: Math.round(Number(result._avg.percentage) * 100) / 100,
      };
    });
  }

  // ==================== ATTENDANCE REPORTS ====================

  async getClassAttendanceReport(classId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const classData = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    const students = await this.prisma.student.findMany({
      where: { classId, status: { in: ['ACTIVE', 'ADMITTED'] } },
      select: { id: true, firstName: true, lastName: true, studentId: true },
    });

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const workingDays = await this.calculateWorkingDays(startDate, endDate);

    const studentReports = students.map(student => {
      const studentAttendance = attendanceRecords.filter(a => a.studentId === student.id);
      const present = studentAttendance.filter(a => a.status === 'PRESENT').length;
      const absent = studentAttendance.filter(a => a.status === 'ABSENT').length;
      const late = studentAttendance.filter(a => a.status === 'LATE').length;
      const halfDay = studentAttendance.filter(a => a.status === 'HALF_DAY').length;

      return {
        studentId: student.id,
        studentCode: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        present,
        absent,
        late,
        halfDay,
        totalDays: workingDays,
        percentage: workingDays > 0 ? Math.round((present / workingDays) * 100) : 0,
      };
    });

    const totalPresent = studentReports.reduce((sum, s) => sum + s.present, 0);
    const totalPossible = studentReports.length * workingDays;

    return {
      class: { id: classId, name: classData.name },
      period: { month, year, startDate, endDate, workingDays },
      summary: {
        totalStudents: students.length,
        totalPresent,
        totalPossible,
        classAverage: totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0,
      },
      students: studentReports,
      generatedAt: new Date(),
    };
  }

  async getStudentAttendanceReport(
    studentId: number,
    startDate?: Date,
    endDate?: Date,
    currentUser?: any,
  ) {
    // Authorization check
    if (currentUser?.role?.name === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId: currentUser.id },
        select: { id: true },
      });
      if (student?.id !== studentId) {
        throw new ForbiddenException('You can only view your own attendance');
      }
    }

    if (currentUser?.role?.name === 'PARENT') {
      const hasAccess = await this.prisma.studentParent.findFirst({
        where: { parent: { userId: currentUser.id }, studentId },
      });
      if (!hasAccess) {
        throw new ForbiddenException('You can only view your children\'s attendance');
      }
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, studentId: true, class: { select: { name: true } } },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: any = { studentId };
    if (startDate) where.date = { gte: startDate };
    if (endDate) where.date = { ...where.date, lte: endDate };

    const attendance = await this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const summary = {
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      halfDay: attendance.filter(a => a.status === 'HALF_DAY').length,
      total: attendance.length,
      percentage: 0, 

    };

    summary.percentage = summary.total > 0 
      ? Math.round((summary.present / summary.total) * 100) 
      : 0;

    return {
      student: {
        id: studentId,
        name: `${student.firstName} ${student.lastName}`,
        code: student.studentId,
        class: student.class?.name,
      },
      period: { startDate, endDate },
      summary,
      records: attendance,
      generatedAt: new Date(),
    };
  }

  // ==================== FINANCIAL REPORTS ====================

  async getFeeCollectionReport(startDate: Date, endDate: Date, classId?: number) {
    const where: any = {
      paymentDate: { gte: startDate, lte: endDate },
      status: 'SUCCESS',
    };

    if (classId) {
      where.student = { classId };
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { firstName: true, lastName: true, studentId: true, class: { select: { name: true } } },
        },
        bill: { select: { billCode: true, config: { select: { feeType: true } } } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

    const byFeeType: Record<string, number> = {};
    for (const payment of payments) {
      const feeType = payment.bill?.config?.feeType || 'OTHER';
      byFeeType[feeType] = (byFeeType[feeType] || 0) + Number(payment.amountPaid);
    }

    const dailyBreakdown: Record<string, number> = {};
    for (const payment of payments) {
      const dateKey = payment.paymentDate.toISOString().split('T')[0];
      dailyBreakdown[dateKey] = (dailyBreakdown[dateKey] || 0) + Number(payment.amountPaid);
    }

    return {
      period: { startDate, endDate },
      summary: {
        totalPayments: payments.length,
        totalCollected,
        averagePayment: payments.length > 0 ? totalCollected / payments.length : 0,
      },
      byFeeType: Object.entries(byFeeType).map(([feeType, amount]) => ({ feeType, amount })),
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, amount]) => ({ date, amount })),
      payments: payments.map(p => ({
        id: p.id,
        date: p.paymentDate,
        amount: Number(p.amountPaid),
        method: p.paymentMethod,
        student: `${p.student.firstName} ${p.student.lastName}`,
        class: p.student.class?.name,
        billCode: p.bill?.billCode,
        feeType: p.bill?.config?.feeType,
      })),
      generatedAt: new Date(),
    };
  }

  async getOutstandingDuesReport(classId?: number, daysOverdue?: number) {
    const whereBill: any = { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } };
    if (classId) whereBill.student = { classId };

    const bills = await this.prisma.bill.findMany({
      where: whereBill,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, studentId: true, class: { select: { name: true } } },
        },
        payments: true,
        config: true,
      },
    });

    const today = new Date();
    const overdueThreshold = daysOverdue ? today.setDate(today.getDate() - daysOverdue) : null;

    const outstandingBills = bills
      .map(bill => {
        const paidAmount = bill.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
        const remaining = Number(bill.totalAmount) - paidAmount;
        const isOverdue = bill.dueDate < new Date() && remaining > 0;
        const daysOverdueCount = isOverdue 
          ? Math.floor((new Date().getTime() - bill.dueDate.getTime()) / (1000 * 3600 * 24))
          : 0;

        return {
          billId: bill.id,
          billCode: bill.billCode,
          studentId: bill.student.id,
          studentName: `${bill.student.firstName} ${bill.student.lastName}`,
          studentCode: bill.student.studentId,
          class: bill.student.class?.name,
          feeType: bill.config?.feeType,
          totalAmount: Number(bill.totalAmount),
          paidAmount,
          remaining,
          dueDate: bill.dueDate,
          status: bill.status,
          isOverdue,
          daysOverdue: daysOverdueCount,
        };
      })
      .filter(bill => bill.remaining > 0);

    if (overdueThreshold) {
      outstandingBills.filter(bill => bill.daysOverdue >= overdueThreshold);
    }

    const totalOutstanding = outstandingBills.reduce((sum, b) => sum + b.remaining, 0);

    return {
      summary: {
        totalOutstandingBills: outstandingBills.length,
        totalOutstandingAmount: totalOutstanding,
        averageOutstanding: outstandingBills.length > 0 ? totalOutstanding / outstandingBills.length : 0,
      },
      byClass: this.groupByClass(outstandingBills),
      bills: outstandingBills,
      generatedAt: new Date(),
    };
  }

  private groupByClass(bills: any[]) {
    const grouped: Record<string, { count: number; amount: number }> = {};
    for (const bill of bills) {
      const className = bill.class || 'Unknown';
      if (!grouped[className]) {
        grouped[className] = { count: 0, amount: 0 };
      }
      grouped[className].count++;
      grouped[className].amount += bill.remaining;
    }
    return Object.entries(grouped).map(([className, data]) => ({
      className,
      ...data,
    }));
  }

  // ==================== ACADEMIC REPORTS ====================

  async getClassPerformanceReport(classId: number, examId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { class: true, examSubjects: { include: { subject: true } } },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const students = await this.prisma.student.findMany({
      where: { classId, status: { in: ['ACTIVE', 'ADMITTED'] } },
      select: { id: true, firstName: true, lastName: true, studentId: true },
    });

    const results = await this.prisma.examResult.findMany({
      where: { examId, studentId: { in: students.map(s => s.id) } },
    });

    const subjectStats = [];
    for (const subject of exam.examSubjects) {
      const subjectResults = results.filter(r => r.subjectId === subject.subjectId);
      const totalMarks = subjectResults.reduce((sum, r) => sum + Number(r.totalMarks), 0);
      const maxPossible = subjectResults.length * subject.maxMarks;

      subjectStats.push({
        subjectId: subject.subjectId,
        subjectName: subject.subject.name,
        totalStudents: subjectResults.length,
        totalMarksObtained: totalMarks,
        maxPossibleMarks: maxPossible,
        averagePercentage: maxPossible > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0,
        passCount: subjectResults.filter(r => Number(r.percentage) >= 40).length,
        failCount: subjectResults.filter(r => Number(r.percentage) < 40).length,
      });
    }

    const studentPerformance = students.map(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      const totalMarks = studentResults.reduce((sum, r) => sum + Number(r.totalMarks), 0);
      const maxPossible = studentResults.reduce((sum, r) => sum + r.maxMarks, 0);
      const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
      const grade = this.calculateGradeFromPercentage(percentage);

      return {
        studentId: student.id,
        studentCode: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        totalMarks,
        maxMarks: maxPossible,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        rank: 0, 
      };
    });

    const rankedStudents = [...studentPerformance].sort((a, b) => b.percentage - a.percentage);
    rankedStudents.forEach((student, index) => {
      student.rank = index + 1;
    });

    return {
      exam: { id: exam.id, name: exam.name, term: exam.term },
      class: { id: classId, name: exam.class.name },
      summary: {
        totalStudents: students.length,
        totalSubjects: exam.examSubjects.length,
        classAverage: studentPerformance.reduce((sum, s) => sum + s.percentage, 0) / studentPerformance.length || 0,
        passCount: studentPerformance.filter(s => s.percentage >= 40).length,
        failCount: studentPerformance.filter(s => s.percentage < 40).length,
      },
      subjectPerformance: subjectStats,
      studentPerformance: rankedStudents,
      generatedAt: new Date(),
    };
  }

  async getSubjectPerformanceReport(subjectId: number, examId: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const results = await this.prisma.examResult.findMany({
      where: { examId, subjectId },
      include: {
        student: {
          select: { firstName: true, lastName: true, studentId: true, class: { select: { name: true } } },
        },
      },
    });

    const totalMarks = results.reduce((sum, r) => sum + Number(r.totalMarks), 0);
    const maxPossible = results.length * (results[0]?.maxMarks || 100);

    const gradeDistribution: Record<string, number> = {};
    for (const result of results) {
      gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
    }

    return {
      subject: { id: subjectId, name: subject.name, code: subject.code },
      examId,
      summary: {
        totalStudents: results.length,
        totalMarksObtained: totalMarks,
        maxPossibleMarks: maxPossible,
        averagePercentage: maxPossible > 0 ? Math.round((totalMarks / maxPossible) * 100) : 0,
        passCount: results.filter(r => Number(r.percentage) >= 40).length,
        failCount: results.filter(r => Number(r.percentage) < 40).length,
      },
      gradeDistribution: Object.entries(gradeDistribution).map(([grade, count]) => ({ grade, count })),
      studentResults: results.map(r => ({
        studentId: r.studentId,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        studentCode: r.student.studentId,
        class: r.student.class?.name,
        marksObtained: Number(r.totalMarks),
        maxMarks: r.maxMarks,
        percentage: Number(r.percentage),
        grade: r.grade,
      })),
      generatedAt: new Date(),
    };
  }

  async getExamResultDistribution(examId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { class: true },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const results = await this.prisma.examResult.findMany({
      where: { examId },
      select: { grade: true, percentage: true },
    });

    const gradeDistribution: Record<string, number> = {};
    for (const result of results) {
      gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
    }

    const passCount = results.filter(r => Number(r.percentage) >= 40).length;
    const failCount = results.filter(r => Number(r.percentage) < 40).length;

    return {
      exam: { id: examId, name: exam.name, term: exam.term },
      class: { id: exam.classId, name: exam.class.name },
      summary: {
        totalResults: results.length,
        passCount,
        failCount,
        passRate: results.length > 0 ? Math.round((passCount / results.length) * 100) : 0,
      },
      gradeDistribution: Object.entries(gradeDistribution).map(([grade, count]) => ({ grade, count })),
      generatedAt: new Date(),
    };
  }

  // ==================== STUDENT PROFILE ====================

  async getCompleteStudentProfile(studentId: number, currentUser?: any) {
    // Authorization check
    if (currentUser?.role?.name === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId: currentUser.id },
        select: { id: true },
      });
      if (student?.id !== studentId) {
        throw new ForbiddenException('You can only view your own profile');
      }
    }

    if (currentUser?.role?.name === 'PARENT') {
      const hasAccess = await this.prisma.studentParent.findFirst({
        where: { parent: { userId: currentUser.id }, studentId },
      });
      if (!hasAccess) {
        throw new ForbiddenException('You can only view your children\'s profile');
      }
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: { email: true, phone: true, isActive: true },
        },
        class: true,
        section: true,
        session: true,
        documents: {
          where: { documentType: 'PHOTO' },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get attendance summary
    const attendance = await this.prisma.attendanceSummary.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 12,
    });

    // Get exam results
    const examResults = await this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get bills and payments
    const bills = await this.prisma.bill.findMany({
      where: { studentId },
      include: {
        config: true,
        payments: true,
      },
    });

    const totalBilled = bills.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = bills.reduce(
      (sum, b) => sum + b.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
      0,
    );

    // Get parents
    const parents = await this.prisma.studentParent.findMany({
      where: { studentId },
      include: {
        parent: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    const overallPercentage = examResults.length > 0
      ? examResults.reduce((sum, r) => sum + Number(r.percentage), 0) / examResults.length
      : 0;

    return {
      profile: {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        email: student.user?.email,
        phone: student.user?.phone,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        address: student.address,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        guardianRelation: student.guardianRelation,
        class: student.class?.name,
        section: student.section?.name,
        session: student.session?.name,
        status: student.status,
        admissionDate: student.admissionDate,
        photo: student.documents[0]?.fileUrl,
      },
      parents: parents.map(p => ({
        name: `${p.parent.user.firstName} ${p.parent.user.lastName}`,
        email: p.parent.user.email,
        phone: p.parent.user.phone,
        relation: p.relation,
      })),
      academic: {
        attendance: {
          summary: {
            totalPresent: attendance.reduce((sum, a) => sum + a.presentDays, 0),
            totalAbsent: attendance.reduce((sum, a) => sum + a.absentDays, 0),
            overallPercentage: attendance.length > 0
              ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length * 100) / 100
              : 0,
          },
          monthlyRecords: attendance,
        },
        exams: {
          totalExams: examResults.length,
          averagePercentage: Math.round(overallPercentage * 100) / 100,
          results: examResults.map(r => ({
            examName: r.exam.name,
            subjectName: r.subject.name,
            marksObtained: Number(r.totalMarks),
            maxMarks: r.maxMarks,
            percentage: Number(r.percentage),
            grade: r.grade,
            date: r.createdAt,
          })),
        },
      },
      financial: {
        totalBilled,
        totalPaid,
        outstanding: totalBilled - totalPaid,
        bills: bills.map(b => ({
          id: b.id,
          code: b.billCode,
          feeType: b.config?.feeType,
          amount: Number(b.totalAmount),
          dueDate: b.dueDate,
          status: b.status,
          paidAmount: b.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
        })),
      },
      generatedAt: new Date(),
    };
  }

  // ==================== EXPORT FUNCTIONALITY ====================

  async exportAttendanceReport(classId: number, month: number, year: number): Promise<Buffer> {
    const report = await this.getClassAttendanceReport(classId, month, year);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    worksheet.columns = [
      { header: 'Student ID', key: 'studentCode', width: 15 },
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Present', key: 'present', width: 10 },
      { header: 'Absent', key: 'absent', width: 10 },
      { header: 'Late', key: 'late', width: 10 },
      { header: 'Half Day', key: 'halfDay', width: 10 },
      { header: 'Total Days', key: 'totalDays', width: 12 },
      { header: 'Percentage', key: 'percentage', width: 12 },
    ];

    worksheet.addRow([]);
    worksheet.addRow(['Attendance Report']);
    worksheet.addRow([`Class: ${report.class.name}`]);
    worksheet.addRow([`Period: ${report.period.month}/${report.period.year}`]);
    worksheet.addRow([`Working Days: ${report.period.workingDays}`]);
    worksheet.addRow([`Class Average: ${report.summary.classAverage}%`]);
    worksheet.addRow([]);

    for (const student of report.students) {
      worksheet.addRow(student);
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async exportFeeCollectionReport(startDate: Date, endDate: Date): Promise<Buffer> {
    const report = await this.getFeeCollectionReport(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Fee Collection Report');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Student', key: 'student', width: 25 },
      { header: 'Class', key: 'class', width: 15 },
      { header: 'Fee Type', key: 'feeType', width: 15 },
      { header: 'Bill Code', key: 'billCode', width: 15 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Method', key: 'method', width: 15 },
    ];

    worksheet.addRow([]);
    worksheet.addRow(['Fee Collection Report']);
    worksheet.addRow([`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`]);
    worksheet.addRow([`Total Collected: ${report.summary.totalCollected}`]);
    worksheet.addRow([`Total Payments: ${report.summary.totalPayments}`]);
    worksheet.addRow([]);

    for (const payment of report.payments) {
      worksheet.addRow({
        date: new Date(payment.date).toLocaleDateString(),
        student: payment.student,
        class: payment.class,
        feeType: payment.feeType,
        billCode: payment.billCode,
        amount: payment.amount,
        method: payment.method,
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async exportStudentGradesToPDF(studentId: number, currentUser?: any): Promise<Buffer> {
    const profile = await this.getCompleteStudentProfile(studentId, currentUser);

    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('Student Academic Report', { align: 'center' });
      doc.moveDown();

      // Student Info
      doc.fontSize(12).text(`Name: ${profile.profile.name}`);
      doc.text(`Student ID: ${profile.profile.studentId}`);
      doc.text(`Class: ${profile.profile.class || 'Not Assigned'}`);
      doc.text(`Section: ${profile.profile.section || 'Not Assigned'}`);
      doc.moveDown();

      // Academic Summary
      doc.fontSize(14).text('Academic Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Total Exams: ${profile.academic.exams.totalExams}`);
      doc.text(`Average Percentage: ${profile.academic.exams.averagePercentage}%`);
      doc.text(`Attendance Rate: ${profile.academic.attendance.summary.overallPercentage}%`);
      doc.moveDown();

      // Results Table
      doc.fontSize(14).text('Exam Results', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      let currentY = tableTop;

      doc.fontSize(10);
      doc.text('Exam Name', 50, currentY);
      doc.text('Subject', 200, currentY);
      doc.text('Marks', 350, currentY);
      doc.text('Grade', 420, currentY);
      doc.text('Date', 470, currentY);

      currentY += 20;
      doc.moveTo(50, currentY - 5).lineTo(550, currentY - 5).stroke();

      for (const result of profile.academic.exams.results) {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }
        doc.text(result.examName, 50, currentY);
        doc.text(result.subjectName, 200, currentY);
        doc.text(`${result.marksObtained}/${result.maxMarks}`, 350, currentY);
        doc.text(result.grade, 420, currentY);
        doc.text(new Date(result.date).toLocaleDateString(), 470, currentY);
        currentY += 20;
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    });
  }

  // ==================== HELPER METHODS ====================

  private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private calculateGradeFromPercentage(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  }

  // src/modules/reports/reports.service.ts

// src/modules/reports/reports.service.ts

async getFeeStatement(studentId: number, fromDate?: string, toDate?: string, currentUser?: any) {
  // ========== AUTHORIZATION CHECK ==========
  if (currentUser?.role?.name === 'STUDENT') {
    const student = await this.prisma.student.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });
    if (student?.id !== studentId) {
      throw new ForbiddenException('You can only view your own fee statement');
    }
  }

  if (currentUser?.role?.name === 'PARENT') {
    const hasAccess = await this.prisma.studentParent.findFirst({
      where: { parent: { userId: currentUser.id }, studentId },
    });
    if (!hasAccess) {
      throw new ForbiddenException('You can only view your children\'s fee statement');
    }
  }

  // ========== GET STUDENT DETAILS ==========
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true, class: true },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  // ========== DATE FILTERS ==========
  const startDate = fromDate ? new Date(fromDate) : undefined;
  const endDate = toDate ? new Date(toDate) : undefined;

  // ========== GET BILLS WITH PAYMENTS ==========
  const bills = await this.prisma.bill.findMany({
    where: {
      studentId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    },
    include: {
      config: true,
      payments: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // ========== BUILD STATEMENT ==========
  const statement = {
    student: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentCode: student.studentId,
      class: student.class?.name,
      email: student.user?.email,
      phone: student.user?.phone,
    },
    period: {
      fromDate: fromDate || 'All Time',
      toDate: toDate || 'All Time',
    },
    summary: {
      totalBilled: 0,
      totalPaid: 0,
      outstanding: 0,
    },
    transactions: [] as any[],
  };

  // ========== PROCESS EACH BILL ==========
  for (const bill of bills) {
    const paidAmount = bill.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const remaining = Number(bill.totalAmount) - paidAmount;

    statement.summary.totalBilled += Number(bill.totalAmount);
    statement.summary.totalPaid += paidAmount;

    // Add bill entry
    statement.transactions.push({
      id: bill.id,
      date: bill.createdAt,
      type: 'BILL',
      reference: bill.billCode,
      description: `${bill.config?.feeType || 'Fee'} - ${bill.billCode}`,
      debit: Number(bill.totalAmount),
      credit: 0,
      balance: 0,
      status: bill.status,
    });

    // Add payment entries
    for (const payment of bill.payments) {
      statement.transactions.push({
        id: payment.id,
        date: payment.paymentDate,
        type: 'PAYMENT',
        reference: `PAY-${payment.id}`,
        description: `Payment via ${payment.paymentMethod}`,
        debit: 0,
        credit: Number(payment.amountPaid),
        balance: 0,
        status: payment.status,
      });
    }
  }

  // ========== CALCULATE RUNNING BALANCE ==========
  let runningBalance = 0;
  statement.transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const transaction of statement.transactions) {
    runningBalance += transaction.debit - transaction.credit;
    transaction.balance = runningBalance;
  }

  statement.summary.outstanding = runningBalance;

  // ========== ADD PAYMENT SUMMARY ==========
  const paymentMethods: Record<string, number> = {};
  for (const bill of bills) {
    for (const payment of bill.payments) {
      const method = payment.paymentMethod;
      paymentMethods[method] = (paymentMethods[method] || 0) + Number(payment.amountPaid);
    }
  }

  return {
    ...statement,
    paymentBreakdown: Object.entries(paymentMethods).map(([method, amount]) => ({
      method,
      amount,
    })),
    generatedAt: new Date(),
  };
}
}