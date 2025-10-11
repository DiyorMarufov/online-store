import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMerchantProductDto } from './dto/create-merchant_product.dto';
import { UpdateMerchantProductDto } from './dto/update-merchant_product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantProductsRepo } from 'src/core/repo/merchant_products.repo';
import { MerchantProductsEntity } from 'src/core/entity/merchant_products.entity';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { MerchantsRepo } from 'src/core/repo/merchants.repo';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class MerchantProductsService {
  constructor(
    @InjectRepository(MerchantProductsEntity)
    private readonly merchantProductRepo: MerchantProductsRepo,
    @InjectRepository(MerchantsEntity)
    private readonly merchantRepo: MerchantsRepo,
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
  ) {}
  async create(createMerchantProductDto: CreateMerchantProductDto) {
    try {
      const { merchant_id, product_variant_id } = createMerchantProductDto;
      const existsMerchant = await this.merchantRepo.findOne({
        where: { id: merchant_id },
      });

      if (!existsMerchant) {
        throw new NotFoundException(
          `Merchant with ID ${merchant_id} not found`,
        );
      }

      const existsProductVariant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
      });

      if (!existsProductVariant) {
        throw new NotFoundException(
          `Product variant with ID ${product_variant_id} not found`,
        );
      }

      const newMerchantProduct = this.merchantProductRepo.create({
        ...createMerchantProductDto,
        merchant: existsMerchant,
        product_variant: existsProductVariant,
      });
      await this.merchantProductRepo.save(newMerchantProduct);

      return successRes(
        {
          merchant_id: newMerchantProduct.merchant.id,
          product_variant_id: newMerchantProduct.product_variant.id,
          price: newMerchantProduct.price,
          stock: newMerchantProduct.stock,
          is_active: newMerchantProduct.is_active,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
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
