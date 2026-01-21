import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errorDetails: any = null;
    let debugInfo: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const r: any = res;

        if (Array.isArray(r.message) && r.message.length > 0) {
          message = r.message[0];
        } else if (typeof r.message === 'string') {
          message = r.message;
        } else if (typeof r.error === 'string') {
          message = r.error;
        }

        // Preserve all error details
        errorDetails = r;
        
        // Also include any additional details passed from the service
        if (r.details) {
          debugInfo = r.details;
        }
        if (r.error && typeof r.error === 'object') {
          debugInfo = { ...debugInfo, ...r.error };
        }
      }
    } else {
      const anyException: any = exception;

      console.error('========================================');
      console.error('           UNHANDLED EXCEPTION          ');
      console.error('========================================');
      console.error('Timestamp:', new Date().toISOString());
      console.error('Full error object:', JSON.stringify(anyException, this.getAllPropertyNames(anyException), 2));
      console.error('Error name:', anyException?.name);
      console.error('Error code:', anyException?.code);
      console.error('Error message:', anyException?.message);
      console.error('Error meta:', anyException?.meta);
      console.error('Error stack:', anyException?.stack);
      
      // Log additional SQL-specific details if available
      if (anyException?.code?.startsWith('P')) {
        console.error('--- Prisma Error Details ---');
        console.error('Prisma code:', anyException.code);
        console.error('Prisma message:', anyException.message);
        console.error('Prisma meta:', JSON.stringify(anyException.meta, null, 2));
        console.error('---------------------------');
      }
      
      console.error('========================================\n');

      // Prisma unique constraint handler
      if (anyException?.code === 'P2002') {
        status = HttpStatus.BAD_REQUEST;
        const field = anyException.meta?.target?.[0] ?? 'Field';
        message = `${field} must be unique - "${anyException.meta?.target_value || ''}" already exists`;
        errorDetails = {
          code: anyException.code,
          message: anyException.message,
          meta: anyException.meta,
        };
        debugInfo = {
          table: anyException.meta?.target?.[0],
          conflictingValue: anyException.meta?.target_value,
        };
      }
      // Prisma foreign key constraint
      else if (anyException?.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = `Referenced record does not exist: ${anyException.meta?.field_name || 'Unknown field'}`;
        errorDetails = {
          code: anyException.code,
          message: anyException.message,
          meta: anyException.meta,
        };
        debugInfo = {
          constraint: anyException.meta?.constraint,
          field: anyException.meta?.field_name,
        };
      }
      // Prisma record not found
      else if (anyException?.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = anyException.message || 'Record not found';
        errorDetails = {
          code: anyException.code,
          message: anyException.message,
          meta: anyException.meta,
        };
      }
      // Prisma required relation not present
      else if (anyException?.code === 'P2014') {
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid relation: ${anyException.message}`;
        errorDetails = {
          code: anyException.code,
          message: anyException.message,
          meta: anyException.meta,
        };
      }
      // Prisma value filter failed
      else if (anyException?.code === 'P2016') {
        status = HttpStatus.BAD_REQUEST;
        message = `Query error: ${anyException.message}`;
        errorDetails = {
          code: anyException.code,
          message: anyException.message,
          meta: anyException.meta,
        };
      }
      // Any other error - EXPOSE EVERYTHING
      else {
        message = anyException?.message || 'Internal server error';
        
        // Build comprehensive debug info
        debugInfo = {
          name: anyException?.name,
          code: anyException?.code,
          message: anyException?.message,
          meta: anyException?.meta,
          table: anyException?.table,
          column: anyException?.column,
          constraint: anyException?.constraint,
          stack: process.env.NODE_ENV === 'development' ? anyException?.stack : undefined,
          // Include all properties of the error object
          fullError: this.sanitizeError(anyException),
        };
        
        errorDetails = {
          message: anyException?.message,
          code: anyException?.code,
        };
      }
    }

    // Build the response - always include debug info in development
    const responseBody: any = {
      success: false,
      message,
    };

    // Always include error details if available
    if (errorDetails) {
      responseBody.error = errorDetails;
    }

    // Always include debug info in development mode
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      responseBody.debug = debugInfo;
    }

    // In development, also include stack trace for non-HttpException errors
    if (process.env.NODE_ENV === 'development' && debugInfo?.stack) {
      responseBody.stack = debugInfo.stack;
    }

    response.status(status).json(responseBody);
  }

  // Helper to get all property names including symbols
  private getAllPropertyNames(obj: any): string[] {
    const props: string[] = [];
    let proto = obj;
    while (proto) {
      Object.getOwnPropertyNames(proto).forEach(prop => {
        if (props.indexOf(prop) === -1 && prop !== 'constructor') {
          props.push(prop);
        }
      });
      proto = Object.getPrototypeOf(proto);
    }
    return props;
  }

  // Helper to sanitize error object for safe JSON serialization
  private sanitizeError(obj: any): any {
    try {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== 'object') return obj;
      if (typeof obj === 'function') return obj.toString();
      
      const result: any = {};
      const keys = Object.keys(obj);
      
      for (const key of keys) {
        try {
          const value = obj[key];
          if (typeof value === 'function') {
            result[key] = '[Function]';
          } else if (typeof value === 'symbol') {
            result[key] = value.toString();
          } else if (typeof value === 'object' && value !== null) {
            // Limit depth for nested objects
            if (key === 'stack' || key === 'message') {
              result[key] = value;
            } else if (Object.keys(value).length < 10) {
              result[key] = this.sanitizeError(value);
            } else {
              result[key] = '[Complex Object]';
            }
          } else {
            result[key] = value;
          }
        } catch (e) {
          result[key] = '[Error accessing property]';
        }
      }
      
      return result;
    } catch (e) {
      return { error: 'Failed to serialize error object' };
    }
  }
}

