import { Module } from '@nestjs/common';
import { ProductVariantsAttributesService } from './product_variants_attributes.service';
import { ProductVariantsAttributesController } from './product_variants_attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';
import { ProductVariantAttributesEntity } from 'src/core/entity/product_variant_attributes.entity';
import { ProductVariantAttributeValuesEntity } from 'src/core/entity/product_variant_attribute_value.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariantsEntity,
      ProductAttributesEntity,
      ProductAttributeValuesEntity,
      ProductVariantAttributesEntity,
      ProductVariantAttributeValuesEntity,
      ProductsEntity,
      UsersEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [ProductVariantsAttributesController],
  providers: [ProductVariantsAttributesService],
})
export class ProductVariantsAttributesModule {}
