import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductsEntity } from './products.entity';
import { OrderItemsEntity } from './order_items.entity';
import { MerchantProductsEntity } from './merchant_products.entity';
import { CartItemsEntity } from './cart_items.entity';
import { ProductVariantAttributesEntity } from './product_variant_attributes.entity';

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

  @Column({ type: 'int', name: 'stock', unsigned: true })
  stock: number;

  @Column({ type: 'varchar', name: 'image' })
  image: string;

  @Column({ type: 'varchar', name: 'slug', unique: true, nullable: true })
  slug: string;

  @OneToMany(() => OrderItemsEntity, (orderItem) => orderItem.product_variant)
  order_items: OrderItemsEntity[];

  @OneToMany(
    () => MerchantProductsEntity,
    (merchantProduct) => merchantProduct.product_variant,
  )
  merchant_products: MerchantProductsEntity[];

  @OneToMany(() => CartItemsEntity, (cartItem) => cartItem.product_variant)
  cart_items: CartItemsEntity[];

  @OneToMany(
    () => ProductVariantAttributesEntity,
    (productVariantAttribute) => productVariantAttribute.product_variant,
  )
  product_variant_attributes: ProductVariantAttributesEntity[];
}
