import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { BcryptService } from 'src/infrastructure/bcrypt';
import { TokenService } from 'src/infrastructure/jwt';
import { MailModule } from 'src/infrastructure/mail/mail.module';
import { CartEntity } from 'src/core/entity/cart.entity';
import { WalletsEntity } from 'src/core/entity/wallets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, CartEntity,WalletsEntity]), MailModule],
  controllers: [UsersController],
  providers: [UsersService, BcryptService, TokenService],
})
export class UsersModule {}
