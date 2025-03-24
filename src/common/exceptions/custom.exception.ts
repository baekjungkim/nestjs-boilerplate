import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(messageKey: string, status = HttpStatus.BAD_REQUEST, data?: any) {
    super({ messageKey }, status, data);
  }
}
