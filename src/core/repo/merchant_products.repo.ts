import { Repository } from 'typeorm';
import { MerchantProductsEntity } from '../entity/merchant_products.entity';

export type MerchantProductsRepo = Repository<MerchantProductsEntity>;
