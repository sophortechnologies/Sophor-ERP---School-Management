// src/common/interceptors/permission-filter.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PermissionService } from '../../modules/auth/permission.service';

@Injectable()
export class PermissionFilterInterceptor implements NestInterceptor {
  constructor(
    private permissionService: PermissionService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      map(async data => {
        // Only filter list responses that are plain arrays
        if (!Array.isArray(data) || data.length === 0) {
          return data;
        }

        const resource = this.getResourceFromUrl(request.url);
        // No resource mapping found — return data as-is (don't silently drop it)
        if (!resource) return data;

        // Get user context for filtering
        const userContext = await this.permissionService.getUserRoleContext(
          user.id,
        );

        return this.filterByRole(data, resource, userContext);
      }),
    );
  }

  private getResourceFromUrl(url: string): string | null {
    if (url.includes('/students')) return 'student';
    if (url.includes('/attendance')) return 'attendance';
    if (url.includes('/exams')) return 'exam';
    if (url.includes('/grades')) return 'grade';
    return null;
  }

  private async filterByRole(
    data: any[],
    resource: string,
    userContext: any,
  ): Promise<any[]> {
    if (!userContext) return data;

    const roleCode = userContext.role?.code || '';

    // Super Admin and Admin see everything
    if (['SUPER_ADMIN', 'ADMIN'].includes(roleCode)) {
      return data;
    }

    // Finance / HR / Staff roles — see full data (access is already controlled by @Roles guards)
    if (['FINANCE', 'HR', 'STAFF', 'HOD'].includes(roleCode)) {
      return data;
    }

    // Teacher/Class Teacher filtering — scope to assigned classes only
    if (['TEACHER', 'CLASS_TEACHER', 'SUBJECT_TEACHER'].includes(roleCode)) {
      return this.filterForTeacher(data, resource, userContext);
    }

    // Student filtering — scope to own data only
    if (roleCode === 'STUDENT') {
      return this.filterForStudent(data, resource, userContext);
    }

    // Parent filtering — parent-level access control is handled in controller/service
    // Return data as-is here; the controller already validates parent owns the child
    if (roleCode === 'PARENT') {
      return data;
    }

    // Unknown role — return data as-is (guards already validated access above)
    return data;
  }

  private async filterForTeacher(
    data: any[],
    resource: string,
    context: any,
  ): Promise<any[]> {
    if (!context.isTeacher) return data;

    const assignedClassIds = context.assignedClasses || [];

    // If teacher has no class assignments yet, return all (newly assigned teacher)
    if (assignedClassIds.length === 0) return data;

    switch (resource) {
      case 'student':
        return data.filter(student =>
          assignedClassIds.includes(student.classId) ||
          (student.section?.classId && assignedClassIds.includes(student.section.classId))
        );

      case 'attendance':
        return data.filter(attendance =>
          assignedClassIds.includes(attendance.classId)
        );

      case 'exam':
        return data.filter(exam =>
          assignedClassIds.includes(exam.classId)
        );

      default:
        return data.filter(item =>
          !item.departmentId || item.departmentId === context.departmentId
        );
    }
  }

  private filterForStudent(data: any[], resource: string, context: any): any[] {
    const studentId = this.extractStudentId(context);

    // If no student record linked to this user yet, return empty (safety default)
    if (!studentId) return [];

    switch (resource) {
      case 'student':
        return data.filter(student => student.id === studentId);

      case 'grade':
      case 'attendance':
      case 'exam':
        return data.filter(item => item.studentId === studentId);

      default:
        return [];
    }
  }

  private extractStudentId(context: any): number | null {
    // context.studentId is populated by PermissionService.getUserRoleContext()
    // when the user has an associated Student record
    return context?.studentId ?? null;
  }
}
