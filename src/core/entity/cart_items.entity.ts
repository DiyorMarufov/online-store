import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CartEntity } from './cart.entity';
import { ProductVariantsEntity } from './product_variants.entity';

@Entity('cart_items')
export class CartItemsEntity extends BaseEntity {
  @ManyToOne(() => CartEntity, (cart) => cart.cart_items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: CartEntity;

  @ManyToOne(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.cart_items,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_id', referencedColumnName: 'id' })
  product_variant: ProductVariantsEntity;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;
}
