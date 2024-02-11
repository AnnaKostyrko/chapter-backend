import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error.name === 'EntityNotFoundError') {
          const errorMessage = error.message;
          const match = errorMessage.match(/\"(.*?)\"/);
          const extractedText = match ? match[1] : null;

          throw new NotFoundException(`${extractedText} not found`);
        }

        throw error;
      }),
    );
  }
}
