import { Repository } from 'typeorm';
import { ReviewsEntity } from '../entity/reviews.entity';

export type ReviewsRepo = Repository<ReviewsEntity>;
