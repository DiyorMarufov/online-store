import { Module } from '@nestjs/common';
import { MerchantProductsService } from './merchant_products.service';
import { MerchantProductsController } from './merchant_products.controller';
import { MerchantProductsEntity } from 'src/core/entity/merchant_products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MerchantProductsEntity,
      ProductVariantsEntity,
      UsersEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [MerchantProductsController],
  providers: [MerchantProductsService],
})
export class MerchantProductsModule {}
