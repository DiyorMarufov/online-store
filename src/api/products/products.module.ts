import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity, CategoriesEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, TokenService],
})
export class ProductsModule {}
