import { Repository } from 'typeorm';
import { FavoritesEntity } from '../entity/favorites.entity';

export type FavoritesRepo = Repository<FavoritesEntity>;
