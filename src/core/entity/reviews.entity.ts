import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from './users.entity';
import { ProductsEntity } from './products.entity';

@Entity('reviews')
export class ReviewsEntity extends BaseEntity {
  @ManyToOne(() => UsersEntity, (user) => user.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: UsersEntity;

  @ManyToOne(() => ProductsEntity, (product) => product.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: ProductsEntity;

  @Column({ type: 'smallint', name: 'rating' })
  rating: number;

  @Column({ type: 'text', name: 'comment' })
  comment: string;
}
