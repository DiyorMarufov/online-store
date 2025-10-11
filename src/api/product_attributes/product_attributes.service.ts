import { ConflictException, Injectable } from '@nestjs/common';
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
      const allProductAttributes = await this.productAttribute.find();
      return successRes(allProductAttributes);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
