import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { BcryptService } from 'src/infrastructure/bcrypt';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [UsersController],
  providers: [UsersService, BcryptService, TokenService],
})
export class UsersModule {}
