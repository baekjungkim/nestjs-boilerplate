import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private tokenBlacklistService: TokenBlacklistService) {}

  @Post('cleanup-tokens')
  @Roles(UserRole.ADMIN)
  async cleanupExpiredTokens() {
    const result = await this.tokenBlacklistService.cleanupExpiredTokens();
    return {
      message: '만료된 토큰이 삭제되었습니다.',
      deletedCount: result.count,
    };
  }
}
