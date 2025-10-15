import { Module } from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { OrderItemsController } from './order_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItemsEntity])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
