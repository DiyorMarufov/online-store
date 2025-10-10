import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductVariantsAttributesService } from './product_variants_attributes.service';
import { CreateProductVariantsAttributeDto } from './dto/create-product_variants_attribute.dto';
import { UpdateProductVariantsAttributeDto } from './dto/update-product_variants_attribute.dto';

@Controller('product-variants-attributes')
export class ProductVariantsAttributesController {
  constructor(private readonly productVariantsAttributesService: ProductVariantsAttributesService) {}

  @Post()
  create(@Body() createProductVariantsAttributeDto: CreateProductVariantsAttributeDto) {
    return this.productVariantsAttributesService.create(createProductVariantsAttributeDto);
  }

  @Get()
  findAll() {
    return this.productVariantsAttributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantsAttributesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductVariantsAttributeDto: UpdateProductVariantsAttributeDto) {
    return this.productVariantsAttributesService.update(+id, updateProductVariantsAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsAttributesService.remove(+id);
  }
}
