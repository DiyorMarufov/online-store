import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
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

  @ManyToMany(
    () => ProductVariantAttributesEntity,
    (attr) => attr.product_values,
  )
  product_variant_attributes: ProductVariantAttributesEntity[];
}
