import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MerchantsEntity } from './merchants.entity';
import { ProductVariantsEntity } from './product_variants.entity';

@Entity('merchant_products')
export class MerchantProductsEntity extends BaseEntity {
  @ManyToOne(() => MerchantsEntity, (merchant) => merchant.merchant_products, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'merchant_id', referencedColumnName: 'id' })
  merchant: MerchantsEntity;

  @ManyToOne(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.merchant_products,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_id', referencedColumnName: 'id' })
  product_variant: ProductVariantsEntity;

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

  @Column({ type: 'boolean', name: 'is_active', default: true })
  is_active: boolean;
}
