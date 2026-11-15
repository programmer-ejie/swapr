import {
  ArgumentsHost,
  Catch,
  HttpException,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      response
        .status(exception.getStatus())
        .json(typeof body === 'string' ? { message: body } : body);
      return;
    }
    response
      .status(500)
      .json({
        message: 'The request could not be completed. Please try again.',
      });
  }
}
