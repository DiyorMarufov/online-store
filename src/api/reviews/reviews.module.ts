import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      ProductsEntity,
      ReviewsEntity,
      OrderItemsEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
