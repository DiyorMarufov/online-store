import { Module } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsEntity } from 'src/core/entity/cart_items.entity';
import { CartEntity } from 'src/core/entity/cart.entity';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItemsEntity,
      CartEntity,
      ProductVariantsEntity,
      UsersEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
