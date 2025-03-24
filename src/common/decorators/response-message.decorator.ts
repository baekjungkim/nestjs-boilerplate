import { MessageMeta } from '@/common/constants/response-messages/types';
import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

export const ResponseMessage = (
  meta: MessageMeta,
): ReturnType<typeof SetMetadata> => SetMetadata(RESPONSE_MESSAGE_KEY, meta);
