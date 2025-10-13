import { BaseEntity } from 'src/common/database/baseEntity';
import { Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
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

  @ManyToMany(
    () => ProductAttributeValuesEntity,
    (value) => value.product_variant_attributes,
    {
      cascade: true,
    },
  )
  @JoinTable({
    name: 'product_variant_attribute_values', // or any name you prefer
    joinColumn: { name: 'product_variant_attribute_id' },
    inverseJoinColumn: { name: 'value_id' },
  })
  product_values: ProductAttributeValuesEntity[];
}
