import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantsAttributeDto } from './dto/create-product_variants_attribute.dto';
import { UpdateProductVariantsAttributeDto } from './dto/update-product_variants_attribute.dto';
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
  async create(
    createProductVariantsAttributeDto: CreateProductVariantsAttributeDto,
  ) {
    try {
      const { product_variant_id, attribute_id, value_id } =
        createProductVariantsAttributeDto;
      const existsProductVariant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
      });

      if (!existsProductVariant) {
        throw new NotFoundException(
          `Product variant with ID ${product_variant_id} not found`,
        );
      }

      const existsProductAttribute = await this.productAttributeRepo.findOne({
        where: { id: attribute_id },
      });

      if (!existsProductAttribute) {
        throw new NotFoundException(
          `Product attribute with ID ${attribute_id} not found`,
        );
      }

      const existsProductAttributeValue =
        await this.productAttributeValueRepo.findOne({
          where: { id: value_id },
        });

      if (!existsProductAttributeValue) {
        throw new NotFoundException(
          `Product attribute value with ID ${value_id} not found`,
        );
      }

      const newProductVariantAttribute =
        this.productVariantAttributeRepo.create({
          product_variant: existsProductVariant,
          product_attribute: existsProductAttribute,
          product_value: existsProductAttributeValue,
        });

      await this.productVariantAttributeRepo.save(newProductVariantAttribute);
      return successRes(
        {
          product_variant_id: newProductVariantAttribute.product_variant.id,
          attribute_id: newProductVariantAttribute.product_attribute.id,
          value_id: newProductVariantAttribute.product_value.id,
        },
        201,
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
}
