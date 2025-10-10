import { Repository } from 'typeorm';
import { CategoriesEntity } from '../entity/categories.entity';

export type CategoriesRepo = Repository<CategoriesEntity>;
