import { Module } from '@nestjs/common';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { ProductAttributeValuesController } from './product_attribute_values.controller';

@Module({
  controllers: [ProductAttributeValuesController],
  providers: [ProductAttributeValuesService],
})
export class ProductAttributeValuesModule {}
