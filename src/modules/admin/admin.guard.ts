import { AdminResponseKeys } from '@/common/constants/response-messages';
import { CustomException } from '@/common/exceptions/custom.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      return false;
    }

    const requiredRole = this.reflector.get<UserRole>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRole) {
      return false;
    }

    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.STAFF]: 1,
      [UserRole.USER]: 0,
    };

    if (roleHierarchy[request.user.role] < roleHierarchy[requiredRole]) {
      throw new CustomException(AdminResponseKeys.UNAUTHORIZED_OPERATION, 403);
    }
  }
}
