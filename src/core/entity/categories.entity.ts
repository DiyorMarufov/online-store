import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductsEntity } from './products.entity';

@Entity('categories')
export class CategoriesEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string;

  @OneToMany(() => ProductsEntity, (product) => product.category)
  products: ProductsEntity[];
}
