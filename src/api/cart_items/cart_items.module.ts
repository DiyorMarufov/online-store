import { Module } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsEntity } from 'src/core/entity/cart_items.entity';
import { CartEntity } from 'src/core/entity/cart.entity';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItemsEntity,
      CartEntity,
      ProductVariantsEntity,
    ]),
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
