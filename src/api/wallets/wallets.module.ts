import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletsEntity, UsersEntity])],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
