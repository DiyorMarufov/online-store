import { Repository } from 'typeorm';
import { ProductAttributeValuesEntity } from '../entity/product_attribute_values.entity';

export type ProductAttributeValuesRepo =
  Repository<ProductAttributeValuesEntity>;
