import { Injectable } from '@nestjs/common';
import { CreateProductAttributeValueDto } from './dto/create-product_attribute_value.dto';
import { UpdateProductAttributeValueDto } from './dto/update-product_attribute_value.dto';

@Injectable()
export class ProductAttributeValuesService {
  create(createProductAttributeValueDto: CreateProductAttributeValueDto) {
    return 'This action adds a new productAttributeValue';
  }

  findAll() {
    return `This action returns all productAttributeValues`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productAttributeValue`;
  }

  update(id: number, updateProductAttributeValueDto: UpdateProductAttributeValueDto) {
    return `This action updates a #${id} productAttributeValue`;
  }

  remove(id: number) {
    return `This action removes a #${id} productAttributeValue`;
  }
}
