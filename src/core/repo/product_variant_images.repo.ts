import { Repository } from 'typeorm';
import { ProductVariantImagesEntity } from '../entity/product_variant_images.entity';

export type ProductVariantImagesRepo = Repository<ProductVariantImagesEntity>;
