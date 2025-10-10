import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UsersEntity } from './users.entity';
import { ProductsEntity } from './products.entity';

@Entity('favorites')
export class FavoritesEntity extends BaseEntity {
  @ManyToOne(() => UsersEntity, (user) => user.favorites, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: UsersEntity;

  @ManyToOne(() => ProductsEntity, (product) => product.favorites, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: ProductsEntity;
}
