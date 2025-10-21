import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductVariantsAttributeDto } from './dto/create-product_variants_attribute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantAttributesRepo } from 'src/core/repo/product_variant_attributes.repo';
import { ProductVariantAttributesEntity } from 'src/core/entity/product_variant_attributes.entity';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributesRepo } from 'src/core/repo/product_attributes.repo';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';
import { ProductAttributeValuesRepo } from 'src/core/repo/product_attribute_values.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';
import slugify from 'slugify';
import { ProductVariantAttributeValuesEntity } from 'src/core/entity/product_variant_attribute_value.entity';
import { ProductVariantAttributeValueRepo } from 'src/core/repo/product_variant_attribute_value.repo';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { index } from 'src/infrastructure/meili-search/meili.search';

@Injectable()
export class ProductVariantsAttributesService {
  constructor(
    @InjectRepository(ProductVariantAttributesEntity)
    private readonly productVariantAttributeRepo: ProductVariantAttributesRepo,
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    @InjectRepository(ProductAttributesEntity)
    private readonly productAttributeRepo: ProductAttributesRepo,
    @InjectRepository(ProductAttributeValuesEntity)
    private readonly productAttributeValueRepo: ProductAttributeValuesRepo,
    @InjectRepository(ProductVariantAttributeValuesEntity)
    private readonly productVariantAttributeValueRepo: ProductVariantAttributeValueRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
  ) {}
  async create(createDto: CreateProductVariantsAttributeDto) {
    try {
      const { product_variant_id, attribute_id, value_id } = createDto;

      const variant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
        relations: [
          'product_variant_attributes',
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_attribute',
          'product_variant_attributes.product_variant_attribute_values.value',
          'product',
        ],
      });

      const attribute = await this.productAttributeRepo.findOne({
        where: { id: attribute_id },
      });
      if (!attribute)
        throw new NotFoundException(
          `Product attribute with ID ${attribute_id} not found`,
        );

      const value = await this.productAttributeValueRepo.findOne({
        where: { id: value_id },
      });
      if (!value)
        throw new NotFoundException(
          `Product attribute value with ID ${value_id} not found`,
        );

      if (!variant) {
        const newVariantAttribute = this.productVariantAttributeRepo.create({
          product_variant: { id: product_variant_id } as any,
          product_attribute: attribute,
          product_variant_attribute_values: [
            this.productVariantAttributeValueRepo.create({
              value,
            }),
          ],
        });
        await this.productVariantAttributeRepo.save(newVariantAttribute);

        return successRes(
          { product_variant_id, attribute_id, value_id },
          201,
          'New product_variant_attribute created successfully',
        );
      }

      let variantAttribute = variant.product_variant_attributes.find(
        (attr) => attr.product_attribute.id === attribute_id,
      );

      if (!variantAttribute) {
        const newVariantAttribute = this.productVariantAttributeRepo.create({
          product_variant: variant,
          product_attribute: attribute,
          product_variant_attribute_values: [
            this.productVariantAttributeValueRepo.create({ value }),
          ],
        });

        await this.productVariantAttributeRepo.save(newVariantAttribute);
      } else {
        const alreadyHasValue =
          variantAttribute.product_variant_attribute_values.some(
            (v) => v.value.id === value_id,
          );
        if (alreadyHasValue) {
          throw new ConflictException(
            `Product variant already has this attribute (${attribute.name}) with this value`,
          );
        }

        const newVariantAttrValue =
          this.productVariantAttributeValueRepo.create({
            product_variant_attribute: variantAttribute,
            value,
          });
        await this.productVariantAttributeValueRepo.save(newVariantAttrValue);
      }

      const updatedVariant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
        relations: [
          'product',
          'product_variant_attributes',
          'product_variant_attributes.product_attribute',
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_variant_attribute_values.value',
        ],
      });

      if (updatedVariant) {
        const baseSlug = slugify(updatedVariant.product.name, {
          lower: true,
          strict: true,
        });

        const attrValues = updatedVariant.product_variant_attributes
          .flatMap((attr) =>
            attr.product_variant_attribute_values.map((v) => v.value.value),
          )
          .filter(Boolean);

        let finalSlug = baseSlug;
        if (attrValues.length > 0) {
          const joinedAttrs = slugify(attrValues.join('-'), {
            lower: true,
            strict: true,
          });
          finalSlug += `-${joinedAttrs}`;
        }

        let uniqueSlug = finalSlug;
        let count = 1;
        while (
          await this.productVariantRepo.findOne({
            where: { slug: uniqueSlug },
          })
        ) {
          uniqueSlug = `${finalSlug}-${count++}`;
        }

        updatedVariant.slug = uniqueSlug;
        await this.productVariantRepo.save(updatedVariant);
      }

      if (updatedVariant) {
        const product = updatedVariant.product;
        const fullProduct = await this.productRepo.findOne({
          where: { id: product.id },
          relations: [
            'category',
            'product_variants',
            'product_variants.product_variant_attributes',
            'product_variants.product_variant_attributes.product_attribute',
            'product_variants.product_variant_attributes.product_variant_attribute_values',
            'product_variants.product_variant_attributes.product_variant_attribute_values.value',
          ],
        });

        const productForMeili = {
          id: fullProduct?.id,
          name: fullProduct?.name,
          description: fullProduct?.description,
          image: fullProduct?.image,
          is_active: fullProduct?.is_active,
          average_rating: fullProduct?.average_rating,
          category_id: fullProduct?.category.id,
          attribute_id: fullProduct?.product_variants.flatMap((v) =>
            v.product_variant_attributes.map((a) => a.product_attribute.id),
          ),
          attribute_value_id: fullProduct?.product_variants.flatMap((v) =>
            v.product_variant_attributes.flatMap((a) =>
              a.product_variant_attribute_values.map((val) => val.value.id),
            ),
          ),
          created_at: fullProduct?.created_at,
        };

        await index.addDocuments([productForMeili]);
      }
      return successRes(
        { product_variant_id, attribute_id, value_id },
        200,
        'Product variant attributes updated and slug regenerated successfully',
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductVariantAttributes =
        await this.productVariantAttributeRepo.find({
          relations: ['product_variant', 'product_variant.product'],
        });
      return successRes(allProductVariantAttributes);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const productVariantAttribute =
        await this.productVariantAttributeRepo.findOne({
          where: { id },
          relations: [
            'product_variant',
            'product_variant.product',
            'product_attribute',
            'product_value',
          ],
        });

      if (!productVariantAttribute) {
        throw new NotFoundException(
          `Product variant attribute with ID ${id} not found`,
        );
      }

      return successRes(productVariantAttribute);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
