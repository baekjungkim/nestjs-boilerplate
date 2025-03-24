import { ValidationMessageKeys } from '@/common/constants/response-messages';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: ValidationMessageKeys.INVALID_EMAIL })
  email: string;

  @ApiProperty({
    description:
      '사용자 비밀번호 (최소 8자, 숫자 1개, 특수문자 1개, 영문자 1개)',
    example: 'Password123!',
  })
  @IsString({ message: ValidationMessageKeys.REQUIRED_PASSWORD })
  @MinLength(8, { message: ValidationMessageKeys.MIN_LENGTH_PASSWORD })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Za-z]).*$/, {
    message: ValidationMessageKeys.MATCHES_PASSWORD,
  })
  password: string;
}
