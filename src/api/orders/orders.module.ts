import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TokenService } from 'src/infrastructure/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from 'src/core/entity/orders.entity';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersEntity, UsersEntity])],
  controllers: [OrdersController],
  providers: [OrdersService, TokenService],
})
export class OrdersModule {}
