import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats error responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let details: any = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, any>;
      message = responseObj['message'] || exception.message;
      details = responseObj['details'] || null;
    } else {
      message = exceptionResponse as string;
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    // Send formatted error response
    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: Array.isArray(message) ? message[0] : message,
        details: Array.isArray(message) && message.length > 1 ? message : details,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}