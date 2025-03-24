import { MessageMeta } from '@/common/constants/response-messages/types';

export enum UsersResponseKeys {
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS',
  USER_CREATED = 'USER_CREATED',
  USER_LIST_RETRIEVED = 'USER_LIST_RETRIEVED',
  USER_PROFILE_RETRIEVED = 'USER_PROFILE_RETRIEVED',
  USER_RETRIEVED = 'USER_RETRIEVED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
}

export const UsersResponseMessages: Record<UsersResponseKeys, MessageMeta> = {
  [UsersResponseKeys.USER_LOGIN_SUCCESS]: {
    key: UsersResponseKeys.USER_LOGIN_SUCCESS,
    description: {
      en: 'User logged in successfully',
      ko: '사용자가 성공적으로 로그인했습니다.',
    },
  },
  [UsersResponseKeys.TOKEN_REFRESHED]: {
    key: UsersResponseKeys.TOKEN_REFRESHED,
    description: {
      en: 'Access token refreshed successfully',
      ko: '토큰이 성공적으로 갱신되었습니다.',
    },
  },
  [UsersResponseKeys.USER_LOGOUT_SUCCESS]: {
    key: UsersResponseKeys.USER_LOGOUT_SUCCESS,
    description: {
      en: 'User logged out successfully',
      ko: '성공적으로 로그아웃했습니다.',
    },
  },
  [UsersResponseKeys.USER_CREATED]: {
    key: UsersResponseKeys.USER_CREATED,
    description: {
      en: 'User created successfully',
      ko: '사용자가 성공적으로 생성되었습니다.',
    },
  },
  [UsersResponseKeys.USER_LIST_RETRIEVED]: {
    key: UsersResponseKeys.USER_LIST_RETRIEVED,
    description: {
      en: 'User list retrieved successfully',
      ko: '사용자 목록을 성공적으로 조회했습니다.',
    },
  },
  [UsersResponseKeys.USER_PROFILE_RETRIEVED]: {
    key: UsersResponseKeys.USER_PROFILE_RETRIEVED,
    description: {
      en: 'User profile retrieved successfully',
      ko: '사용자 프로필을 성공적으로 조회했습니다.',
    },
  },
  [UsersResponseKeys.USER_RETRIEVED]: {
    key: UsersResponseKeys.USER_RETRIEVED,
    description: {
      en: 'User retrieved successfully',
      ko: '사용자 정보를 성공적으로 조회했습니다.',
    },
  },
  [UsersResponseKeys.USER_UPDATED]: {
    key: UsersResponseKeys.USER_UPDATED,
    description: {
      en: 'User updated successfully',
      ko: '사용자 정보가 성공적으로 수정되었습니다.',
    },
  },
  [UsersResponseKeys.USER_DELETED]: {
    key: UsersResponseKeys.USER_DELETED,
    description: {
      en: 'User deleted successfully',
      ko: '사용자가 성공적으로 삭제되었습니다.',
    },
  },
};
