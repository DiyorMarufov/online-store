import { Repository } from 'typeorm';
import { ProductVariantAttributeValuesEntity } from '../entity/product_variant_attribute_value.entity';

export type ProductVariantAttributeValueRepo =
  Repository<ProductVariantAttributeValuesEntity>;
