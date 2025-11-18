import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { ProductVariantsController } from './product_variants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { FileModule } from 'src/infrastructure/file/file.module';
import { ProductVariantImagesEntity } from 'src/core/entity/product_variant_images.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariantsEntity,
      ProductsEntity,
      ProductVariantImagesEntity,
      UsersEntity,
    ]),
    FileModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
})
export class ProductVariantsModule {}
