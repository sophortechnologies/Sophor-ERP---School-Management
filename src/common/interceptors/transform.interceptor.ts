import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response format interface
 */
export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Transform Interceptor
 * Wraps all successful responses in a standard format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: any) => {
        // If data already has success property, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract message from data if present
        const message = data?.message || 'Operation successful';
        const responseData = data?.data !== undefined ? data.data : data;

        return {
          success: true,
          data: responseData,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}