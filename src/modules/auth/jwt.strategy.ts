import { AuthErrorKeys } from '@/common/constants/response-messages';
import { CustomException } from '@/common/exceptions/custom.exception';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  // JWT에서 사용자 정보 확인
  async validate(req: Request, payload: JwtPayload) {
    try {
      // 1. 토큰 타입 체크
      if (payload.type !== 'access') {
        throw new CustomException(AuthErrorKeys.INVALID_TOKEN_TYPE, 401);
      }

      // 2. 블랙리스트 체크 추가
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new CustomException(AuthErrorKeys.TOKEN_NOT_FOUND, 401);
      }
      if (await this.tokenBlacklistService.isBlacklisted(token)) {
        const res = req.res;
        if (res) {
          res.clearCookie('refresh_token');
          // 프론트엔드에 로그아웃 필요성을 알리는 응답
          throw new CustomException(AuthErrorKeys.TOKEN_REVOKED, 401, {
            logout: true,
          });
        }
      }

      // 3. 사용자 존재 여부 확인
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new CustomException(AuthErrorKeys.USER_NOT_FOUND, 401);
      }

      return { id: payload.sub, email: payload.email, role: user.role };
    } catch (error) {
      throw new CustomException(AuthErrorKeys.UNAUTHORIZED, 401);
    }
  }
}
