import { Repository } from 'typeorm';
import { CartItemsEntity } from '../entity/cart_items.entity';

export type CartitemsRepo = Repository<CartItemsEntity>;
