import { Module } from '@nestjs/common';
import { MerchantProductsService } from './merchant_products.service';
import { MerchantProductsController } from './merchant_products.controller';
import { MerchantProductsEntity } from 'src/core/entity/merchant_products.entity';
import { TokenService } from 'src/infrastructure/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantProductsEntity])],
  controllers: [MerchantProductsController],
  providers: [MerchantProductsService, TokenService],
})
export class MerchantProductsModule {}
