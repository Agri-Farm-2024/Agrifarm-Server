import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        const message =
          context.switchToHttp().getRequest().message ||
          'Request processed successfully'; // Default message

        return {
          message: message, // Customize this message
          statusCode: statusCode,
          status: statusCode === 200 || 201 || 204 ? 'success' : 'error', // Adjust success/error based on status
          metadata: data || null, // Data can be anything from the handler (null if no data)
        };
      }),
    );
  }
}
