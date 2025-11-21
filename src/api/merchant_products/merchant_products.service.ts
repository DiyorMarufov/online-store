import {
  BadRequestException,
  ForbiddenException,
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
import { UpdateMerchantProductDto } from './dto/update-merchant_product.dto';
import { UsersRoles } from 'src/common/enum';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';

@Injectable()
export class MerchantProductsService {
  constructor(
    @InjectRepository(MerchantProductsEntity)
    private readonly merchantProductRepo: MerchantProductsRepo,
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createMerchantProductDto: CreateMerchantProductDto,
    user: UsersEntity,
  ) {
    const { merchant_id, product_variant_id, stock, price, is_active } =
      createMerchantProductDto;

    return await this.dataSource.transaction(async (manager) => {
      const existsMerchant = await manager.findOne(MerchantsEntity, {
        where: { id: merchant_id },
        relations: ['user'],
      });
      if (!existsMerchant)
        throw new NotFoundException(
          `Merchant with ID ${merchant_id} not found`,
        );

      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchant.user.id
      ) {
        throw new ForbiddenException(
          'You are not allowed to create a product for another merchant',
        );
      }

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

      return successRes({}, 201, 'New merchant product created successfully');
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

  async findAllForMerchant(user: UsersEntity) {
    try {
      const allMerchantProducts = await this.merchantProductRepo.find({
        where: {
          merchant: { user: { id: user.id } },
        },
        relations: ['product_variant', 'product_variant.product'],
        select: {
          id: true,
          product_variant: {
            id: true,
            product: {
              id: true,
              name: true,
            },
          },
          price: true,
          stock: true,
          created_at: true,
        },
      });
      return successRes(allMerchantProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async totalMerchantProducts(user: UsersEntity) {
    try {
      const totalMerchantProducts = await this.merchantProductRepo.count({
        where: { id: user.id },
      });
      return successRes(totalMerchantProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findMerchantProductsById(id: number) {
    try {
      const products = await this.merchantProductRepo.find({
        where: {
          merchant: {
            user: { id },
          },
        },
        relations: {
          product_variant: {
            product: true,
          },
        },
        select: {
          id: true,
          price: true,
          stock: true,
          is_active: true,

          product_variant: {
            id: true,
            price: true,
            product: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return successRes(products);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForAdminById(id: number) {
    try {
      const allMerchantProducts = await this.merchantProductRepo.find({
        where: {
          product_variant: {
            product: {
              id,
            },
          },
        },
        relations: [
          'merchant',
          'merchant.user',
          'product_variant',
          'product_variant.images',
          'product_variant.product_variant_attributes',
          'product_variant.product_variant_attributes.product_variant_attribute_values',
          'product_variant.product_variant_attributes.product_variant_attribute_values.value',
          'product_variant.product_variant_attributes.product_variant_attribute_values.value.product_attribute',
        ],
        select: {
          id: true,
          merchant: {
            id: true,
            store_name: true,
            store_logo: true,
            user: {
              id: true,
              full_name: true,
              role: true,
            },
          },
          price: true,
          stock: true,
          is_active: true,
          product_variant: {
            id: true,
            product_variant_attributes: {
              id: true,
              product_variant_attribute_values: {
                id: true,
                value: {
                  id: true,
                  product_attribute: {
                    id: true,
                    name: true,
                  },
                  value: true,
                },
              },
            },
            images: {
              id: true,
              image: true,
            },
          },
        },
      });
      return successRes(allMerchantProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateMerchantProductDto: UpdateMerchantProductDto,
    id: number,
    user: UsersEntity,
  ) {
    try {
      const { product_variant_id } = updateMerchantProductDto;

      const existsMerchantProduct = await this.merchantProductRepo.findOne({
        where: { id },
        relations: ['merchant', 'merchant.user'],
      });

      if (!existsMerchantProduct) {
        throw new NotFoundException(`Merchant product with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchantProduct.merchant.user.id
      ) {
        throw new NotFoundException(`Can't update other's product`);
      }

      if (product_variant_id) {
        const existsProductVariant = await this.productVariantRepo.findOne({
          where: {
            id: product_variant_id,
          },
        });

        if (!existsProductVariant) {
          throw new NotFoundException(
            `Product variant with ID ${product_variant_id} not found`,
          );
        }

        await this.merchantProductRepo.save({
          ...existsMerchantProduct,
          ...updateMerchantProductDto,
          product_variant: existsProductVariant,
        });
      } else {
        await this.merchantProductRepo.update(id, updateMerchantProductDto);
      }

      return successRes({}, 200, 'Merchant product updated successfully');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number, user: UsersEntity) {
    try {
      const existsMerchantProduct = await this.merchantProductRepo.findOne({
        where: { id },
        relations: ['merchant', 'merchant.user'],
      });
      if (!existsMerchantProduct) {
        throw new NotFoundException(`Merchant product with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchantProduct.merchant.user.id
      ) {
        throw new NotFoundException(`Can't delete other's product`);
      }

      await this.merchantProductRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
