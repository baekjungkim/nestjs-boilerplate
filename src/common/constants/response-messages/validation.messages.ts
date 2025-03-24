import { MessageMeta } from './types';

export enum ValidationMessageKeys {
  INVALID_EMAIL = 'INVALID_EMAIL',
  REQUIRED_PASSWORD = 'REQUIRED_PASSWORD',
  MIN_LENGTH_PASSWORD = 'MIN_LENGTH_PASSWORD',
  MATCHES_PASSWORD = 'MATCHES_PASSWORD',
}

export const ValidationErrorMessages: Record<
  ValidationMessageKeys,
  MessageMeta
> = {
  [ValidationMessageKeys.INVALID_EMAIL]: {
    key: ValidationMessageKeys.INVALID_EMAIL,
    description: {
      ko: '유효한 이메일 주소를 입력해주세요.',
      en: 'Please enter a valid email address.',
    },
  },
  [ValidationMessageKeys.REQUIRED_PASSWORD]: {
    key: ValidationMessageKeys.REQUIRED_PASSWORD,
    description: {
      ko: '비밀번호는 필수 항목입니다.',
      en: 'Password is required.',
    },
  },
  [ValidationMessageKeys.MIN_LENGTH_PASSWORD]: {
    key: ValidationMessageKeys.MIN_LENGTH_PASSWORD,
    description: {
      ko: '비밀번호는 최소 8자 이상이어야 합니다.',
      en: 'Password must be at least 8 characters long.',
    },
  },
  [ValidationMessageKeys.MATCHES_PASSWORD]: {
    key: ValidationMessageKeys.MATCHES_PASSWORD,
    description: {
      ko: '비밀번호는 숫자 1개, 특수 문자 1개, 영숫자 1개 등 최소 8개의 문자를 포함해야 합니다.',
      en: 'Password must contain at least one number, one special character, and one alphanumeric character.',
    },
  },
};
