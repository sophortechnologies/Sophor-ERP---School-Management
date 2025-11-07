import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  BadRequestException, 
} from '@nestjs/common'; 
import { Response } from 'express'; 
 
/** 
 * Validation Exception Filter 
 * Formats class-validator validation errors 
 */ 
@Catch(BadRequestException) 
export class ValidationExceptionFilter implements ExceptionFilter { 
  catch(exception: BadRequestException, host: ArgumentsHost) { 
    const ctx = host.switchToHttp(); 
    const response = ctx.getResponse<Response>(); 
    const status = exception.getStatus(); 
    const exceptionResponse: any = exception.getResponse(); 
 
    let errors: any[] = []; 
 
    if ( 
      exceptionResponse.message && 
      Array.isArray(exceptionResponse.message) 
    ) { 
      errors = exceptionResponse.message; 
    } 
 
    response.status(status).json({ 
      success: false, 
      error: { 
        code: status, 
        message: 'Validation failed', 
        details: errors, 
      }, 
      timestamp: new Date().toISOString(), 
    }); 
  } 
} 