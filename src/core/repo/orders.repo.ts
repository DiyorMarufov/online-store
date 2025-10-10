import { Repository } from 'typeorm';
import { OrdersEntity } from '../entity/orders.entity';

export type OrdersRepo = Repository<OrdersEntity>;
