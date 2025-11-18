import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AuthGuard } from './auth.guard';
import { TokenModule } from 'src/infrastructure/jwt/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), TokenModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
