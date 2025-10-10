import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrdersEntity } from './orders.entity';
import { ProductVariantsEntity } from './product_variants.entity';

@Entity('order_items')
export class OrderItemsEntity extends BaseEntity {
  @ManyToOne(() => OrdersEntity, (order) => order.order_items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: OrdersEntity;

  @ManyToOne(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.order_items,
    {
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_id', referencedColumnName: 'id' })
  product_variant: ProductVariantsEntity;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;

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
}
