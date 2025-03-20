import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto.';
import { JwtPayload } from './jwt-payload.interface';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(registerDto.password, salt);
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcryptjs.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: { email: string; password: string }, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일이 존재하지 않습니다.');
    }

    const isPasswordValid = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      ...payload,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '1d',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '15m',
      }),
      expires_in: 60 * 15,
      token_type: 'Bearer',
    };
  }

  async refreshToken(refreshToken: string, accessToken: string, res: Response) {
    try {
      // 1. 토큰 검증
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // 2. 블랙리스트 체크
      if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // 3. 사용자 확인
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 4. 이전 토큰 블랙리스에 추가
      await Promise.all([
        this.tokenBlacklistService.addToBlacklist(
          refreshToken,
          new Date(Date.now() + 24 * 60 * 60 * 1000), // 1일
          TokenType.REFRESH,
        ),
        this.tokenBlacklistService.addToBlacklist(
          accessToken,
          new Date(Date.now() + 15 * 60 * 1000), // 15분
          TokenType.ACCESS,
        ),
      ]);

      // 5. 새로운 토큰 발급
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        type: 'access',
      };

      const newRefreshPayload: JwtPayload = {
        ...newPayload,
        type: 'refresh',
      };

      // 6. 새로운 리프레시 토큰 발급 및 쿠키 설정
      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        expiresIn: '1d', // 1일
      });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1일
      });

      // 7. 새로운 액세스 토큰 발급
      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: '15m',
        }),
        expires_in: 60 * 15,
        token_type: 'Bearer',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string, accessToken: string) {
    try {
      await Promise.all([
        this.tokenBlacklistService.addToBlacklist(
          refreshToken,
          new Date(Date.now() + 24 * 60 * 60 * 1000), // 1일
          TokenType.REFRESH,
        ),
        this.tokenBlacklistService.addToBlacklist(
          accessToken,
          new Date(Date.now() + 15 * 60 * 1000), // 15분
          TokenType.ACCESS,
        ),
      ]);
      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
