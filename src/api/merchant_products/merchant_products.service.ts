import { Injectable } from '@nestjs/common';
import { CreateMerchantProductDto } from './dto/create-merchant_product.dto';
import { UpdateMerchantProductDto } from './dto/update-merchant_product.dto';

@Injectable()
export class MerchantProductsService {
  create(createMerchantProductDto: CreateMerchantProductDto) {
    return 'This action adds a new merchantProduct';
  }

  findAll() {
    return `This action returns all merchantProducts`;
  }
}
