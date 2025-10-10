import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductAttributesEntity } from './product_attributes.entity';
import { ProductVariantAttributesEntity } from './product_variant_attributes.entity';

@Entity('product_attribute_values')
export class ProductAttributeValuesEntity extends BaseEntity {
  @ManyToOne(
    () => ProductAttributesEntity,
    (productAttribute) => productAttribute.product_attribute_values,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_attribute_id', referencedColumnName: 'id' })
  product_attribute: ProductAttributesEntity;

  @Column({ type: 'varchar', name: 'value' })
  value: string;

  @OneToMany(
    () => ProductVariantAttributesEntity,
    (productVariantAttribute) => productVariantAttribute.product_value,
  )
  product_variant_attributes: ProductVariantAttributesEntity[];
}
