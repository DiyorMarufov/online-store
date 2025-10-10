import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { CreateProductAttributeValueDto } from './dto/create-product_attribute_value.dto';
import { UpdateProductAttributeValueDto } from './dto/update-product_attribute_value.dto';

@Controller('product-attribute-values')
export class ProductAttributeValuesController {
  constructor(private readonly productAttributeValuesService: ProductAttributeValuesService) {}

  @Post()
  create(@Body() createProductAttributeValueDto: CreateProductAttributeValueDto) {
    return this.productAttributeValuesService.create(createProductAttributeValueDto);
  }

  @Get()
  findAll() {
    return this.productAttributeValuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productAttributeValuesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductAttributeValueDto: UpdateProductAttributeValueDto) {
    return this.productAttributeValuesService.update(+id, updateProductAttributeValueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productAttributeValuesService.remove(+id);
  }
}
