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

    const isHttpException = exception instanceof HttpException ||
      (typeof exception === 'object' && exception !== null && 'getStatus' in exception && 'getResponse' in exception);

    if (isHttpException) {
      const httpException = exception as any;
      const httpStatus = httpException.getStatus();
      const httpRes = httpException.getResponse();

      // Enhanced Validation Error Handling
      if (httpStatus === HttpStatus.BAD_REQUEST && httpRes.message && Array.isArray(httpRes.message)) {
        response.status(httpStatus).json({
          success: false,
          message: 'Validation failed',
          errors: httpRes.errors || httpRes.message.map((msg: string) => ({
            field: msg.split(' ')[0] || 'field',
            messages: [msg],
          })),
        });
        return;
      }

      // If the response is already an object (e.g., our custom payload), forward it
      if (httpRes && typeof httpRes === 'object') {
        response.status(httpStatus).json({
          success: false, // Ensure success: false is always present
          ...httpRes,
        });
        return;
      }

      // Fallback for string messages
      status = httpStatus;
      if (typeof httpRes === 'string') {
        message = httpRes;
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
