import { Repository } from 'typeorm';
import { ProductVariantsEntity } from '../entity/product_variants.entity';

export type ProductVariantsRepo = Repository<ProductVariantsEntity>;
