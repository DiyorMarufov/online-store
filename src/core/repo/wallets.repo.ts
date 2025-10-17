import { Repository } from 'typeorm';
import { WalletsEntity } from '../entity/wallets.entity';

export type WalletsRepo = Repository<WalletsEntity>;
