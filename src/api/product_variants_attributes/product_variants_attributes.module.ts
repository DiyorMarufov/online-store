import { Module } from '@nestjs/common';
import { ProductVariantsAttributesService } from './product_variants_attributes.service';
import { ProductVariantsAttributesController } from './product_variants_attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';
import { ProductVariantAttributesEntity } from 'src/core/entity/product_variant_attributes.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariantsEntity,
      ProductAttributesEntity,
      ProductAttributeValuesEntity,
      ProductVariantAttributesEntity,
    ]),
  ],
  controllers: [ProductVariantsAttributesController],
  providers: [ProductVariantsAttributesService, TokenService],
})
export class ProductVariantsAttributesModule {}
