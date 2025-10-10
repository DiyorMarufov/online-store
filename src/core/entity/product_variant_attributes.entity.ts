import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductVariantsEntity } from './product_variants.entity';
import { ProductAttributesEntity } from './product_attributes.entity';
import { ProductAttributeValuesEntity } from './product_attribute_values.entity';

@Entity('product_variant_attributes')
export class ProductVariantAttributesEntity extends BaseEntity {
  @ManyToOne(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.product_variant_attributes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_id', referencedColumnName: 'id' })
  product_variant: ProductVariantsEntity;

  @ManyToOne(
    () => ProductAttributesEntity,
    (productAttribute) => productAttribute.product_variant_attributes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'attribute_id', referencedColumnName: 'id' })
  product_attribute: ProductAttributesEntity;

  @ManyToOne(
    () => ProductAttributeValuesEntity,
    (productAttributeValue) => productAttributeValue.product_variant_attributes,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'value_id', referencedColumnName: 'id' })
  product_value: ProductAttributeValuesEntity;
}
