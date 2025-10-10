import { Module } from '@nestjs/common';
import { ProductAttributesService } from './product_attributes.service';
import { ProductAttributesController } from './product_attributes.controller';

@Module({
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService],
})
export class ProductAttributesModule {}
