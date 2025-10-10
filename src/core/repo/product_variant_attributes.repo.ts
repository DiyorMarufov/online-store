import { Repository } from 'typeorm';
import { ProductVariantAttributesEntity } from '../entity/product_variant_attributes.entity';

export type ProductVariantAttributesRepo =
  Repository<ProductVariantAttributesEntity>;
