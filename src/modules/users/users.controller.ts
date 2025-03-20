import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto.';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '사용자 로그인을 처리합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인이 성공적으로 처리되었습니다.',
    schema: {
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증에 실패했습니다.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(
      { email: loginDto.email, password: loginDto.password },
      res,
    );
  }

  @Post('refreshToken')
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰이 성공적으로 갱신되었습니다.',
    schema: {
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 리프레시 토큰입니다.',
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken || !accessToken) {
      throw new UnauthorizedException('Token not found');
    }
    return this.authService.refreshToken(refreshToken, accessToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken || !accessToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    await this.authService.logout(refreshToken, accessToken);
    res.clearCookie('refresh_token');
    return { message: 'Successfully logged out' };
  }

  @Post()
  @ApiOperation({
    summary: '사용자 생성',
    description: '새로운 사용자를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '사용자가 성공적으로 생성되었습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '모든 사용자 조회',
    description: '시스템의 모든 사용자 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록을 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '현재 사용자 정보를 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  getProfile(@Req() req) {
    return this.usersService.findOneById(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '특정 사용자 조회',
    description: 'ID로 특정 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보를 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '사용자 정보 수정',
    description: '특정 사용자의 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보가 성공적으로 수정되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '사용자 삭제',
    description: '특정 사용자를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
