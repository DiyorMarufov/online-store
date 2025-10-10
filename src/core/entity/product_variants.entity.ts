import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductsEntity } from './products.entity';

@Entity('product_variants')
export class ProductVariantsEntity extends BaseEntity {
  @ManyToOne(() => ProductsEntity, (product) => product.product_variants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: ProductsEntity;

  @Column({
    type: 'decimal',
    name: 'price',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column({ type: 'int', name: 'stock' })
  stock: number;

  @Column({ type: 'varchar', name: 'image' })
  image: string;
}
