import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  AdminResponseMessages,
  AuthErrorMessages,
  UsersResponseMessages,
  ValidationErrorMessages,
} from '../constants/response-messages';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = exception?.getResponse?.();

    const acceptLanguage = request.headers['accept-language'] || 'ko-KR';
    const lang = acceptLanguage.split(',')[0].split(';')[0].split('-')[0];

    const messageKey =
      responseBody?.messageKey ??
      exception?.response?.messageKey ??
      exception?.message ??
      'INTERNAL_SERVER_ERROR';

    const dictionary = {
      ...AdminResponseMessages,
      ...ValidationErrorMessages,
      ...AuthErrorMessages,
      ...UsersResponseMessages,
    };

    const message =
      dictionary?.[messageKey]?.description?.[lang] ??
      dictionary?.[messageKey]?.description?.en ??
      messageKey;

    response.status(status).json({
      statusCode: status,
      errorCode: messageKey,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(exception?.data ?? {}),
    });
  }
}
