import { Module } from '@nestjs/common';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { ProductAttributeValuesController } from './product_attribute_values.controller';
import { TokenService } from 'src/infrastructure/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductAttributesEntity,
      ProductAttributeValuesEntity,
    ]),
  ],
  controllers: [ProductAttributeValuesController],
  providers: [ProductAttributeValuesService, TokenService],
})
export class ProductAttributeValuesModule {}
