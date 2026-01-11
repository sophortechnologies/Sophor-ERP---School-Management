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
        // Only filter list responses
        if (!Array.isArray(data) || data.length === 0) {
          return data;
        }

        const resource = this.getResourceFromUrl(request.url);
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
    if (!userContext) return [];

    const roleCode = userContext.role?.code || '';

    // Super Admin and Admin see everything
    if (['SUPER_ADMIN', 'ADMIN'].includes(roleCode)) {
      return data;
    }

    // Teacher/Class Teacher filtering
    if (['TEACHER', 'CLASS_TEACHER', 'SUBJECT_TEACHER'].includes(roleCode)) {
      return this.filterForTeacher(data, resource, userContext);
    }

    // Student filtering
    if (roleCode === 'STUDENT') {
      return this.filterForStudent(data, resource, userContext);
    }

    // Default: no access
    return [];
  }

  private async filterForTeacher(
    data: any[],
    resource: string,
    context: any,
  ): Promise<any[]> {
    if (!context.isTeacher) return [];

    const assignedClassIds = context.assignedClasses || [];

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
        // Filter by department for other resources
        return data.filter(item => 
          !item.departmentId || item.departmentId === context.departmentId
        );
    }
  }

  private filterForStudent(data: any[], resource: string, context: any): any[] {
    // For student, they can only see their own data
    // This is a simplified version - you'll need to get the student's ID
    const studentId = this.extractStudentId(context);
    
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
    // This should be implemented based on your authentication
    // For now, return null
    return null;
  }
}