import { Repository } from 'typeorm';
import { ProductsEntity } from '../entity/products.entity';

export type ProductsRepo = Repository<ProductsEntity>;
