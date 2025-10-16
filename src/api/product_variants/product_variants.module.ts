import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { ProductVariantsController } from './product_variants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { TokenService } from 'src/infrastructure/jwt';
import { FileModule } from 'src/infrastructure/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariantsEntity, ProductsEntity]),
    FileModule,
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService, TokenService],
})
export class ProductVariantsModule {}
