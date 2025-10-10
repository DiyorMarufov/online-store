import { Repository } from 'typeorm';
import { OrderItemsEntity } from '../entity/order_items.entity';

export type OrderItemsRepo = Repository<OrderItemsEntity>;
