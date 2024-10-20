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
      // Handle array or string messages
      message = Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ') // Join array of messages into a single string
        : errorResponse.message ||
          exception.message ||
          this.getDefaultMessage(status);

      metadata = errorResponse.metadata || null; // Optional: additional error data
    } else {
      // If the exception is not an instance of HttpException (e.g. internal errors)
      message = this.getDefaultMessage(status);
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

  // Helper function to provide default messages based on status codes
  getDefaultMessage(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'You are not authorized to access this resource';
      case HttpStatus.FORBIDDEN:
        return 'You do not have permission to access this resource';
      case HttpStatus.NOT_FOUND:
        return 'The resource you are looking for was not found';
      case HttpStatus.BAD_REQUEST:
        return 'Your request could not be understood or was missing required parameters';
      case HttpStatus.CONFLICT:
        return 'There was a conflict with the current state of the resource';
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'An unexpected error occurred';
    }
  }
}
