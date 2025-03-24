import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      '사용자 비밀번호 (최소 8자, 숫자 1개, 특수문자 1개, 영문자 1개)',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Za-z]).*$/, {
    message:
      'Password must contain at least eight characters, one number, one special character, and one alphanumeric character.',
  })
  password: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @MinLength(2)
  name: string;
}
