import { Repository } from 'typeorm';
import { ProductAttributesEntity } from '../entity/product_attributes.entity';

export type ProductAttributesRepo = Repository<ProductAttributesEntity>;
