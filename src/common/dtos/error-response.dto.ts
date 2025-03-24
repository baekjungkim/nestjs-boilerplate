import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    example: 'INVALID_EMAIL',
    description: '에러 코드 (메시지 키)',
  })
  errorCode: string;

  @ApiProperty({
    example: '유효한 이메일 주소를 입력해주세요.',
    description: '에러 메시지 (다국어 변환된 값)',
  })
  message: string;

  @ApiProperty({
    example: '2025-03-21T10:30:12.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/users/login', description: '요청한 API 경로' })
  path: string;
}
