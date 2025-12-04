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
      }
    } else {
      const anyException: any = exception;

      // Prisma unique constraint handler
      if (anyException?.code === 'P2002') {
        status = HttpStatus.BAD_REQUEST;

        const field = anyException.meta?.target?.[0] ?? 'Field';

        message = `${field} must be unique`;
      }
    }

    response.status(status).json({
      success: false,
      message,
    });
  }
}
