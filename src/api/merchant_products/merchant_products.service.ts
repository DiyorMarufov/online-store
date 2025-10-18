import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchantProductDto } from './dto/create-merchant_product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantProductsRepo } from 'src/core/repo/merchant_products.repo';
import { MerchantProductsEntity } from 'src/core/entity/merchant_products.entity';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';
import { DataSource } from 'typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';

@Injectable()
export class MerchantProductsService {
  constructor(
    @InjectRepository(MerchantProductsEntity)
    private readonly merchantProductRepo: MerchantProductsRepo,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createMerchantProductDto: CreateMerchantProductDto,
    user: UsersEntity,
  ) {
    const { product_variant_id, stock, price, is_active } =
      createMerchantProductDto;

    return await this.dataSource.transaction(async (manager) => {
      const existsMerchant = await manager.findOne(MerchantsEntity, {
        where: { id: user.id },
      });
      if (!existsMerchant)
        throw new NotFoundException(`Merchant with ID ${user.id} not found`);

      const existsProductVariant = await manager.findOne(
        ProductVariantsEntity,
        {
          where: { id: product_variant_id },
          lock: { mode: 'pessimistic_write' },
        },
      );
      if (!existsProductVariant)
        throw new NotFoundException(
          `Product variant with ID ${product_variant_id} not found`,
        );

      if (stock > existsProductVariant.stock) {
        throw new BadRequestException(
          'Merchant stock cannot exceed main product stock',
        );
      }

      existsProductVariant.stock -= stock;
      await manager.save(existsProductVariant);

      const newMerchantProduct = manager.create(MerchantProductsEntity, {
        merchant: existsMerchant,
        product_variant: existsProductVariant,
        stock,
        price,
        is_active,
      });
      await manager.save(newMerchantProduct);

      return {
        merchant_id: newMerchantProduct.merchant.id,
        product_variant_id: newMerchantProduct.product_variant.id,
        price: newMerchantProduct.price,
        stock: newMerchantProduct.stock,
        is_active: newMerchantProduct.is_active,
      };
    });
  }

  async findAll() {
    try {
      const allMerchantProducts = await this.merchantProductRepo.find({
        relations: ['merchant', 'product_variant'],
      });
      return successRes(allMerchantProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
