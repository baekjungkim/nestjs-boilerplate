import { MessageMeta } from '@/common/constants/response-messages/types';

export enum AuthErrorKeys {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  INVALID_TOKEN_TYPE = 'INVALID_TOKEN_TYPE',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export const AuthErrorMessages: Record<AuthErrorKeys, MessageMeta> = {
  [AuthErrorKeys.USER_ALREADY_EXISTS]: {
    key: AuthErrorKeys.USER_ALREADY_EXISTS,
    description: {
      en: 'User with this email already exists.',
      ko: '이미 존재하는 이메일입니다.',
    },
  },
  [AuthErrorKeys.USER_NOT_FOUND]: {
    key: AuthErrorKeys.USER_NOT_FOUND,
    description: {
      en: 'User not found.',
      ko: '유저가 존재하지 않습니다.',
    },
  },
  [AuthErrorKeys.EMAIL_NOT_FOUND]: {
    key: AuthErrorKeys.EMAIL_NOT_FOUND,
    description: {
      en: 'User with this email does not exist.',
      ko: '이메일이 존재하지 않습니다.',
    },
  },
  [AuthErrorKeys.INVALID_PASSWORD]: {
    key: AuthErrorKeys.INVALID_PASSWORD,
    description: {
      en: 'Incorrect password.',
      ko: '비밀번호가 일치하지 않습니다.',
    },
  },
  [AuthErrorKeys.TOKEN_NOT_FOUND]: {
    key: AuthErrorKeys.TOKEN_NOT_FOUND,
    description: {
      en: 'Token is missing.',
      ko: '토큰이 없습니다.',
    },
  },
  [AuthErrorKeys.INVALID_TOKEN_TYPE]: {
    key: AuthErrorKeys.INVALID_TOKEN_TYPE,
    description: {
      en: 'Invalid token type.',
      ko: '유효하지 않은 토큰 타입입니다.',
    },
  },
  [AuthErrorKeys.TOKEN_REVOKED]: {
    key: AuthErrorKeys.TOKEN_REVOKED,
    description: {
      en: 'Token has been revoked.',
      ko: '토큰이 취소되었습니다.',
    },
  },
  [AuthErrorKeys.INVALID_REFRESH_TOKEN]: {
    key: AuthErrorKeys.INVALID_REFRESH_TOKEN,
    description: {
      en: 'Invalid refresh token.',
      ko: '유효하지 않은 리프레시 토큰입니다.',
    },
  },
  [AuthErrorKeys.UNAUTHORIZED]: {
    key: AuthErrorKeys.UNAUTHORIZED,
    description: {
      en: 'Unauthorized.',
      ko: '인증되지 않은 사용자입니다.',
    },
  },
};
