import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ProductVariantAttributesEntity } from './product_variant_attributes.entity';
import { ProductAttributeValuesEntity } from './product_attribute_values.entity';
import { BaseEntity } from 'src/common/database/baseEntity';

@Entity('product_variant_attribute_values')
export class ProductVariantAttributeValuesEntity extends BaseEntity {
  @ManyToOne(
    () => ProductVariantAttributesEntity,
    (variantAttr) => variantAttr.product_variant_attribute_values,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_attribute_id' })
  product_variant_attribute: ProductVariantAttributesEntity;

  @ManyToOne(
    () => ProductAttributeValuesEntity,
    (value) => value.product_variant_attribute_values,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'value_id' })
  value: ProductAttributeValuesEntity;
}
