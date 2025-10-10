import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, MerchantsEntity])],
  controllers: [MerchantsController],
  providers: [MerchantsService],
})
export class MerchantsModule {}
