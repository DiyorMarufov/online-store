import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductAttributeValueDto } from './dto/create-product_attribute_value.dto';
import { UpdateProductAttributeValueDto } from './dto/update-product_attribute_value.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAttributeValuesRepo } from 'src/core/repo/product_attribute_values.repo';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributesRepo } from 'src/core/repo/product_attributes.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class ProductAttributeValuesService {
  constructor(
    @InjectRepository(ProductAttributeValuesEntity)
    private readonly productAttributeValueRepo: ProductAttributeValuesRepo,
    @InjectRepository(ProductAttributesEntity)
    private readonly productAttributeRepo: ProductAttributesRepo,
  ) {}
  async create(createProductAttributeValueDto: CreateProductAttributeValueDto) {
    try {
      const existsAttribute = await this.productAttributeRepo.findOne({
        where: { id: createProductAttributeValueDto.attribute_id },
      });

      if (!existsAttribute) {
        throw new NotFoundException(
          `Product attribute with ID ${createProductAttributeValueDto.attribute_id} not found`,
        );
      }

      const newProductAttributeValue = this.productAttributeValueRepo.create({
        ...createProductAttributeValueDto,
        product_attribute: existsAttribute,
      });

      await this.productAttributeValueRepo.save(newProductAttributeValue);
      return successRes(
        {
          attribute_id: newProductAttributeValue.product_attribute.id,
          value: newProductAttributeValue.value,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductAttributeValues =
        await this.productAttributeValueRepo.find({
          relations: ['product_attribute'],
          select:{
            id: true,
            product_attribute:{
              id: true,
              name: true
            },
            value: true,
            created_at: true
          }
        });

      return successRes(allProductAttributeValues);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateProductAttributeValueDto: UpdateProductAttributeValueDto,
    id: number,
  ) {
    try {
      const { attribute_id } = updateProductAttributeValueDto;
      const existsProductAttributeValue =
        await this.productAttributeValueRepo.findOne({
          where: { id },
        });

      if (!existsProductAttributeValue) {
        throw new NotFoundException(
          `Product attribute value with ID ${id} not found`,
        );
      }

      if (attribute_id) {
        const existsProductAttribute = await this.productAttributeRepo.findOne({
          where: { id: attribute_id },
        });

        if (!existsProductAttribute) {
          throw new NotFoundException(
            `Product attribute with ID ${attribute_id} not found`,
          );
        }

        await this.productAttributeValueRepo.save({
          ...existsProductAttributeValue,
          ...updateProductAttributeValueDto,
          product_attribute: existsProductAttribute,
        });
      } else {
        await this.productAttributeValueRepo.update(
          id,
          updateProductAttributeValueDto,
        );
      }

      return successRes(
        {},
        200,
        'Product attribute value successfully updated',
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number) {
    try {
      const existsProductAttributeValue =
        await this.productAttributeValueRepo.findOne({
          where: { id },
        });

      if (!existsProductAttributeValue) {
        throw new NotFoundException(
          `Product attribute value with ID ${id} not found`,
        );
      }

      await this.productAttributeValueRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
