import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { BcryptService } from 'src/infrastructure/bcrypt';
import { MailModule } from 'src/infrastructure/mail/mail.module';
import { CartEntity } from 'src/core/entity/cart.entity';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CartEntity, WalletsEntity]),
    MailModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
})
export class UsersModule {}
