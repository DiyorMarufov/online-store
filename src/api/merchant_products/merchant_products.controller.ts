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

}
