import { AdminResponseMessages } from '@/common/constants/response-messages';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { AdminGuard } from './admin.guard';

@ApiTags('관리자')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private tokenBlacklistService: TokenBlacklistService) {}

  @Post('cleanup-tokens')
  @Roles(UserRole.ADMIN)
  @ResponseMessage(AdminResponseMessages.TOKEN_CLEANUP_SUCCESS)
  @ApiOperation({
    summary: '만료된 토큰 정리',
    description:
      '데이터베이스에서 만료된 토큰을 삭제합니다. 관리자만 접근 가능합니다.',
  })
  @ApiOkResponse({
    description: '만료된 토큰이 성공적으로 삭제되었습니다.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '만료된 토큰이 삭제되었습니다.' },
        deletedCount: { type: 'number', example: 10 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: '관리자 권한이 필요합니다.',
    type: ErrorResponseDto,
  })
  async cleanupExpiredTokens() {
    const result = await this.tokenBlacklistService.cleanupExpiredTokens();
    return {
      message: '만료된 토큰이 삭제되었습니다.',
      deletedCount: result.count,
    };
  }
}
