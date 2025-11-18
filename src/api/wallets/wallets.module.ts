import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletsEntity, UsersEntity]),
    AuthModule,
    TokenModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
