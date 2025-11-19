import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from 'src/core/entity/orders.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { CartEntity } from 'src/core/entity/cart.entity';
import { AddressesEntity } from 'src/core/entity/addresses.entity';
import { FavoritesEntity } from 'src/core/entity/favorites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdersEntity,
      UsersEntity,
      ReviewsEntity,
      CartEntity,
      AddressesEntity,
      FavoritesEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
