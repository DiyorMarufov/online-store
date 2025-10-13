import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, MerchantsEntity])],
  controllers: [MerchantsController],
  providers: [MerchantsService, TokenService],
})
export class MerchantsModule {}
