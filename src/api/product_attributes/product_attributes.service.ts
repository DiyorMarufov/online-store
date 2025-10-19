import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductAttributeDto } from './dto/create-product_attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product_attribute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAttributesRepo } from 'src/core/repo/product_attributes.repo';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class ProductAttributesService {
  constructor(
    @InjectRepository(ProductAttributesEntity)
    private readonly productAttribute: ProductAttributesRepo,
  ) {}
  async create(createProductAttributeDto: CreateProductAttributeDto) {
    try {
      const existsName = await this.productAttribute.findOne({
        where: { name: createProductAttributeDto.name },
      });

      if (existsName) {
        throw new ConflictException(
          `Product attribute with name ${createProductAttributeDto.name} already exists`,
        );
      }

      const newProductAttribute = this.productAttribute.create(
        createProductAttributeDto,
      );
      await this.productAttribute.save(newProductAttribute);
      return successRes(
        {
          name: newProductAttribute.name,
          type: newProductAttribute.type,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductAttributes = await this.productAttribute.find({
        relations: ['product_attribute_values'],
      });
      return successRes(allProductAttributes);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateProductAttributeDto: UpdateProductAttributeDto,
    id: number,
  ) {
    try {
      const existsProductAttribute = await this.productAttribute.findOne({
        where: { id },
      });

      if (!existsProductAttribute) {
        throw new NotFoundException(
          `Product attribute with ID ${id} not found`,
        );
      }

      await this.productAttribute.update(id, updateProductAttributeDto);
      return successRes({}, 200, 'Product attribute successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number) {
    try {
      const existsProductAttribute = await this.productAttribute.findOne({
        where: { id },
      });

      if (!existsProductAttribute) {
        throw new NotFoundException(
          `Product attribute with ID ${id} not found`,
        );
      }

      await this.productAttribute.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
