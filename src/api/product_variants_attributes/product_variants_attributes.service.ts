import { Injectable } from '@nestjs/common';
import { CreateProductVariantsAttributeDto } from './dto/create-product_variants_attribute.dto';
import { UpdateProductVariantsAttributeDto } from './dto/update-product_variants_attribute.dto';

@Injectable()
export class ProductVariantsAttributesService {
  create(createProductVariantsAttributeDto: CreateProductVariantsAttributeDto) {
    return 'This action adds a new productVariantsAttribute';
  }

  findAll() {
    return `This action returns all productVariantsAttributes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productVariantsAttribute`;
  }

  update(id: number, updateProductVariantsAttributeDto: UpdateProductVariantsAttributeDto) {
    return `This action updates a #${id} productVariantsAttribute`;
  }

  remove(id: number) {
    return `This action removes a #${id} productVariantsAttribute`;
  }
}
