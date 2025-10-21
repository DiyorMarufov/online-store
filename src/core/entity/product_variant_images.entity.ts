import { BaseEntity } from 'src/common/database/baseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductVariantsEntity } from './product_variants.entity';

@Entity('product_variant_images')
export class ProductVariantImagesEntity extends BaseEntity {
  @ManyToOne(
    () => ProductVariantsEntity,
    (productVariant) => productVariant.images,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_variant_id', referencedColumnName: 'id' })
  product_variant: ProductVariantsEntity;

  @Column({ type: 'varchar', name: 'image', nullable: true })
  image?: string;
}
