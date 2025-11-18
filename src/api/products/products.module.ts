import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { FileModule } from 'src/infrastructure/file/file.module';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductsEntity,
      CategoriesEntity,
      ReviewsEntity,
      UsersEntity,
    ]),
    FileModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
