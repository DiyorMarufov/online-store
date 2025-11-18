import { Module } from '@nestjs/common';
import { TokenService } from '.';

@Module({
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
