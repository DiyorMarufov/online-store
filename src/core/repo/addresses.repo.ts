import { Repository } from 'typeorm';
import { AddressesEntity } from '../entity/addresses.entity';

export type AddressesRepo = Repository<AddressesEntity>;
