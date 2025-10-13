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
  ) {}
  async create(createDto: CreateProductVariantsAttributeDto) {
    try {
      const { product_variant_id, attribute_id, value_id } = createDto;

      const variant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
        relations: [
          'product_variant_attributes',
          'product_variant_attributes.product_values',
          'product_variant_attributes.product_attribute',
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
          product_values: [value],
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
          product_values: [value],
        });

        variant.product_variant_attributes.push(newVariantAttribute);
        await this.productVariantAttributeRepo.save(newVariantAttribute);

        return successRes(
          { product_variant_id, attribute_id, value_id },
          201,
          'New attribute added to existing product_variant',
        );
      }

      const alreadyHasValue = variantAttribute.product_values.some(
        (v) => v.id === value_id,
      );
      if (alreadyHasValue) {
        throw new ConflictException(
          `Product variant already has this attribute (${attribute.name}) with this value`,
        );
      }

      await this.productVariantAttributeRepo
        .createQueryBuilder()
        .relation(ProductVariantAttributesEntity, 'product_values')
        .of(variantAttribute.id)
        .add(value.id);

      return successRes(
        { product_variant_id, attribute_id, value_id },
        200,
        'Existing product_variant_attribute updated with new value',
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
