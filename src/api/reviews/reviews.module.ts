import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { TokenService } from 'src/infrastructure/jwt';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      ProductsEntity,
      ReviewsEntity,
      OrderItemsEntity,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, TokenService],
})
export class ReviewsModule {}
