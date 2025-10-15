import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TokenService } from 'src/infrastructure/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersEntity } from 'src/core/entity/orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersEntity])],
  controllers: [OrdersController],
  providers: [OrdersService, TokenService],
})
export class OrdersModule {}
