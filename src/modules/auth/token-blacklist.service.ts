import { Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TokenBlacklistService {
  constructor(private prisma: PrismaService) {}

  async addToBlacklist(token: string, expiresAt: Date, type: TokenType) {
    return this.prisma.tokenBlacklist.create({
      data: {
        token,
        expiresAt,
        type,
      },
    });
  }

  async isBlacklisted(token: string) {
    // 현재 토큰이 블랙리스트에 있는지 확인
    const blacklistedToken = await this.prisma.tokenBlacklist.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!blacklistedToken;
  }

  async cleanupExpiredTokens() {
    return this.prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
