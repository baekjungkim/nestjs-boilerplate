import {
  AuthErrorKeys,
  UsersResponseMessages,
} from '@/common/constants/response-messages';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import { CustomException } from '@/common/exceptions/custom.exception';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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
  @ResponseMessage(UsersResponseMessages.USER_LOGIN_SUCCESS)
  @ApiOperation({
    summary: '로그인',
    description: '사용자 로그인을 처리합니다.',
  })
  @ApiOkResponse({
    description: '로그인이 성공적으로 처리되었습니다.',
    schema: {
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 (예: 이메일 형식 오류)',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '잘못된 이메일 또는 비밀번호',
    type: ErrorResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(
      { email: loginDto.email, password: loginDto.password },
      res,
    );
  }

  @Post('refreshToken')
  @ResponseMessage(UsersResponseMessages.TOKEN_REFRESHED)
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiOkResponse({
    description: '토큰이 성공적으로 갱신되었습니다.',
    schema: {
      properties: {
        access_token: { type: 'string' },
        expires_in: { type: 'number' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken || !accessToken) {
      throw new CustomException(AuthErrorKeys.TOKEN_NOT_FOUND, 401);
    }
    return this.authService.refreshToken(refreshToken, accessToken, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage(UsersResponseMessages.USER_LOGOUT_SUCCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({ description: '로그아웃 성공' })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken || !accessToken) {
      throw new CustomException(AuthErrorKeys.TOKEN_NOT_FOUND, 401);
    }
    await this.authService.logout(refreshToken, accessToken);
    res.clearCookie('refresh_token');
    return { message: 'Successfully logged out' };
  }

  @Post()
  @ResponseMessage(UsersResponseMessages.USER_CREATED)
  @ApiOperation({
    summary: '사용자 생성',
    description: '새로운 사용자를 생성합니다.',
  })
  @ApiCreatedResponse({
    description: '사용자가 성공적으로 생성되었습니다.',
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청입니다.',
    type: ErrorResponseDto,
  })
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UsersResponseMessages.USER_LIST_RETRIEVED)
  @ApiOperation({
    summary: '모든 사용자 조회',
    description: '시스템의 모든 사용자 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '사용자 목록을 성공적으로 조회했습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UsersResponseMessages.USER_PROFILE_RETRIEVED)
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiOkResponse({
    description: '현재 사용자 정보를 성공적으로 조회했습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  getProfile(@Req() req) {
    return this.usersService.findOneById(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UsersResponseMessages.USER_RETRIEVED)
  @ApiOperation({
    summary: '특정 사용자 조회',
    description: 'ID로 특정 사용자의 정보를 조회합니다.',
  })
  @ApiOkResponse({
    description: '사용자 정보를 성공적으로 조회했습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: '사용자를 찾을 수 없습니다.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UsersResponseMessages.USER_UPDATED)
  @ApiOperation({
    summary: '사용자 정보 수정',
    description: '특정 사용자의 정보를 수정합니다.',
  })
  @ApiOkResponse({
    description: '사용자 정보가 성공적으로 수정되었습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: '사용자를 찾을 수 없습니다.',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UsersResponseMessages.USER_DELETED)
  @ApiOperation({
    summary: '사용자 삭제',
    description: '특정 사용자를 삭제합니다.',
  })
  @ApiOkResponse({
    description: '사용자가 성공적으로 삭제되었습니다.',
  })
  @ApiUnauthorizedResponse({
    description: '액세스 토큰이 없거나 유효하지 않습니다.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: '사용자를 찾을 수 없습니다.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
