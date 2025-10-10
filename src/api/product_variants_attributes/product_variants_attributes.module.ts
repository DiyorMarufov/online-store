import { Module } from '@nestjs/common';
import { ProductVariantsAttributesService } from './product_variants_attributes.service';
import { ProductVariantsAttributesController } from './product_variants_attributes.controller';

@Module({
  controllers: [ProductVariantsAttributesController],
  providers: [ProductVariantsAttributesService],
})
export class ProductVariantsAttributesModule {}
