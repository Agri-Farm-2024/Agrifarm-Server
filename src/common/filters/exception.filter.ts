import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let metadata = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse: any = exception.getResponse();
      message = errorResponse.message || exception.message;
      metadata = errorResponse.metadata || null; // Optional: additional error data
    }

    // Customize messages for different HTTP status codes
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        message = 'You are not authorized to access this resource';
        break;
      case HttpStatus.FORBIDDEN:
        message = 'You do not have permission to access this resource';
        break;
      case HttpStatus.NOT_FOUND:
        message = 'The resource you are looking for was not found';
        break;
      case HttpStatus.BAD_REQUEST:
        message =
          'Your request could not be understood or was missing required parameters';
        break;
      case HttpStatus.CONFLICT:
        message = 'There was a conflict with the current state of the resource';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        message = 'An unexpected error occurred';
        break;
    }

    response.status(status).json({
      message: message,
      statusCode: status,
      status: status >= 400 ? 'error' : 'success',
      metadata: metadata || {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
