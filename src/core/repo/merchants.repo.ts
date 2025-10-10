import { Repository } from 'typeorm';
import { MerchantsEntity } from '../entity/merchants.entity';

export type MerchantsRepo = Repository<MerchantsEntity>;
