import { AuthErrorKeys } from '@/common/constants/response-messages';
import { CustomException } from '@/common/exceptions/custom.exception';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err) {
      throw err;
    }

    if (!user) {
      throw new CustomException(AuthErrorKeys.UNAUTHORIZED, 401);
    }

    return user;
  }
}
