import { Module } from '@nestjs/common';
import { MerchantProductsService } from './merchant_products.service';
import { MerchantProductsController } from './merchant_products.controller';

@Module({
  controllers: [MerchantProductsController],
  providers: [MerchantProductsService],
})
export class MerchantProductsModule {}
