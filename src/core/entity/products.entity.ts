import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { Status } from 'src/common/enum';
import { ProductVariantsEntity } from './product_variants.entity';
import { FavoritesEntity } from './favorites.entity';
import { ReviewsEntity } from './reviews.entity';

@Entity('products')
export class ProductsEntity extends BaseEntity {
  @ManyToOne(() => CategoriesEntity, (category) => category.products, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: CategoriesEntity;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'varchar', name: 'image', nullable: true })
  image?: string;

  @Column({
    type: 'enum',
    name: 'is_active',
    enum: Status,
    default: Status.ACTIVE,
  })
  is_active: Status;

  @OneToMany(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.product,
  )
  product_variants: ProductVariantsEntity[];

  @OneToMany(() => FavoritesEntity, (favorite) => favorite.product)
  favorites: FavoritesEntity[];

  @OneToMany(() => ReviewsEntity, (review) => review.product)
  reviews: ReviewsEntity[];
}
