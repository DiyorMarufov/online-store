import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MerchantProductsService } from './merchant_products.service';
import { CreateMerchantProductDto } from './dto/create-merchant_product.dto';
import { UpdateMerchantProductDto } from './dto/update-merchant_product.dto';

@Controller('merchant-products')
export class MerchantProductsController {
  constructor(private readonly merchantProductsService: MerchantProductsService) {}

  @Post()
  create(@Body() createMerchantProductDto: CreateMerchantProductDto) {
    return this.merchantProductsService.create(createMerchantProductDto);
  }

  @Get()
  findAll() {
    return this.merchantProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMerchantProductDto: UpdateMerchantProductDto) {
    return this.merchantProductsService.update(+id, updateMerchantProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantProductsService.remove(+id);
  }
}
