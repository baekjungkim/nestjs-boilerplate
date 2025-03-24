import { MessageMeta } from '@/common/constants/response-messages/types';

export enum AdminResponseKeys {
  TOKEN_CLEANUP_SUCCESS = 'TOKEN_CLEANUP_SUCCESS',
  UNAUTHORIZED_OPERATION = 'UNAUTHORIZED_OPERATION',
}

export const AdminResponseMessages: Record<AdminResponseKeys, MessageMeta> = {
  [AdminResponseKeys.TOKEN_CLEANUP_SUCCESS]: {
    key: AdminResponseKeys.TOKEN_CLEANUP_SUCCESS,
    description: {
      en: 'Expired tokens deleted successfully',
      ko: '만료된 토큰이 성공적으로 삭제되었습니다.',
    },
  },
  [AdminResponseKeys.UNAUTHORIZED_OPERATION]: {
    key: AdminResponseKeys.UNAUTHORIZED_OPERATION,
    description: {
      en: 'You do not have permission to perform this operation',
      ko: '해당 작업을 수행할 권한이 없습니다.',
    },
  },
};
