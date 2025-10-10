import { Repository } from 'typeorm';
import { UsersEntity } from '../entity/users.entity';

export type UsersRepo = Repository<UsersEntity>;
