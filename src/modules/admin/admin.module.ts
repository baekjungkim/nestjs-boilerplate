import { Module } from '@nestjs/common';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [TokenBlacklistService],
})
export class AdminModule {}
