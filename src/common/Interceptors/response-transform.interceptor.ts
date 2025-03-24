// common/interceptors/response-transform.interceptor.ts
import { MessageMeta } from '@/common/constants/response-messages/types';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.getAllAndOverride<MessageMeta>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const acceptLanguage = req.headers['accept-language'] || 'ko-KR';
    const lang = acceptLanguage.split(',')[0].split(';')[0].split('-')[0];

    return next.handle().pipe(
      map((data) => {
        const localizedMessage =
          meta?.description?.[lang] ||
          meta?.description?.en ||
          'REQUEST_SUCCEEDED';

        return {
          statusCode: res.statusCode,
          message: localizedMessage,
          messageKey: meta?.key,
          data,
        };
      }),
    );
  }
}
