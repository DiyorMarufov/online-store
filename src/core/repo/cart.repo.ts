import { Repository } from 'typeorm';
import { CartEntity } from '../entity/cart.entity';

export type CartRepo = Repository<CartEntity>;
