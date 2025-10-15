import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ProductsEntity } from './products.entity';

@Entity('categories')
export class CategoriesEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string;

  @ManyToOne(() => CategoriesEntity, (category) => category.children, {
    onDelete: 'CASCADE',
  })
  parent: CategoriesEntity;

  @OneToMany(() => CategoriesEntity, (category) => category.parent)
  children: CategoriesEntity[];

  @OneToMany(() => ProductsEntity, (product) => product.category)
  products: ProductsEntity[];
}
