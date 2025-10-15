import { Repository } from 'typeorm';
import { PaymentEntity } from '../entity/payment.entity';

export type PaymentRepo = Repository<PaymentEntity>;
