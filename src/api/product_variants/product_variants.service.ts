import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { slugify } from 'src/infrastructure/utils/slugify';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
  ) {}
  async create(createProductVariantDto: CreateProductVariantDto) {
    try {
      const existsProduct = await this.productRepo.findOne({
        where: { id: createProductVariantDto.product_id },
        relations: [
          'product_variants',
          'product_variants.product_variant_attributes',
          'product_variants.product_variant_attributes.product_values',
          'product_variants.product_variant_attributes.product_attribute',
        ],
      });

      if (!existsProduct) {
        throw new NotFoundException(
          `Product with ID ${createProductVariantDto.product_id} not found`,
        );
      }

      const newProduct = this.productVariantRepo.create({
        ...createProductVariantDto,
        product: existsProduct,
      });

      await this.productVariantRepo.save(newProduct);

      const valuesArray =
        newProduct.product_variant_attributes?.flatMap((attr) =>
          attr.product_values.map((val) => val.value),
        ) || [];

      let baseSlug = slugify(existsProduct.name);
      if (valuesArray.length > 0) {
        baseSlug += `-${slugify(valuesArray.join('-'))}`;
      }

      let uniqueSlug = baseSlug;
      let count = 1;
      while (
        await this.productVariantRepo.findOne({ where: { slug: uniqueSlug } })
      ) {
        uniqueSlug = `${baseSlug}_${count}`;
        count++;
      }

      newProduct.slug = uniqueSlug;
      await this.productVariantRepo.save(newProduct);

      return successRes({
        product_id: newProduct.product.id,
        price: newProduct.price,
        stock: newProduct.stock,
        image: newProduct.image,
        slug: newProduct.slug,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductVariants = await this.productVariantRepo.find({
        relations: ['product'],
      });
      return successRes(allProductVariants);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const productVariant = await this.productVariantRepo.findOne({
        where: { id },
        relations: [
          'product',
          'product_variant_attributes',
          'product_variant_attributes.product_attribute',
          'product_variant_attributes.product_values',
        ],
      });

      if (!productVariant) {
        throw new NotFoundException(`Product variant with ID ${id} not found`);
      }

      const formatted = {
        ...productVariant,
        product_variant_attributes:
          productVariant.product_variant_attributes.map((attr) => ({
            id: attr.id,
            created_at: attr.created_at,
            updated_at: attr.updated_at,
            product_attribute: {
              id: attr.product_attribute.id,
              created_at: attr.product_attribute.created_at,
              updated_at: attr.product_attribute.updated_at,
              name: attr.product_attribute.name,
              type: attr.product_attribute.type,
              product_values: attr.product_values.map((v) => ({
                id: v.id,
                created_at: v.created_at,
                updated_at: v.updated_at,
                value: v.value,
              })),
            },
          })),
      };

      return successRes(formatted);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
