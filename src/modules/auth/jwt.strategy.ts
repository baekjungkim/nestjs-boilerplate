import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        throw new UnauthorizedException('Invalid token type');
      }

      // 2. 블랙리스트 체크 추가
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }
      if (await this.tokenBlacklistService.isBlacklisted(token)) {
        const res = req.res;
        if (res) {
          res.clearCookie('refresh_token');
          // 프론트엔드에 로그아웃 필요성을 알리는 응답
          throw new UnauthorizedException({
            message: 'Token has been revoked',
            logout: true, // 프론트엔드에서 이 플래그를 보고 액세스 토큰 삭제 처리
          });
        }
      }

      // 3. 사용자 존재 여부 확인
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { id: payload.sub, email: payload.email, role: user.role };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
