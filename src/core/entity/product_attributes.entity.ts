import { BaseEntity } from 'src/common/database/baseEntity';
import { AttributeTypes } from 'src/common/enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductAttributeValuesEntity } from './product_attribute_values.entity';
import { ProductVariantAttributesEntity } from './product_variant_attributes.entity';

@Entity('product_attributes')
export class ProductAttributesEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({
    type: 'enum',
    name: 'type',
    enum: AttributeTypes,
    default: AttributeTypes.TEXT,
  })
  type: AttributeTypes;

  @OneToMany(
    () => ProductAttributeValuesEntity,
    (productAttributeValues) => productAttributeValues.product_attribute,
  )
  product_attribute_values: ProductAttributeValuesEntity[];

  @OneToMany(
    () => ProductVariantAttributesEntity,
    (productVariantAttribute) => productVariantAttribute.product_attribute,
  )
  product_variant_attributes: ProductVariantAttributesEntity[];
}
