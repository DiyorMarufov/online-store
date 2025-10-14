import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartitemsRepo } from 'src/core/repo/cart_items.repo';
import { CartItemsEntity } from 'src/core/entity/cart_items.entity';
import { CartEntity } from 'src/core/entity/cart.entity';
import { CartRepo } from 'src/core/repo/cart.repo';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItemsEntity)
    private readonly cartItemRepo: CartitemsRepo,
    @InjectRepository(CartEntity)
    private readonly cartRepo: CartRepo,
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
  ) {}
  async create(createCartItemDto: CreateCartItemDto) {
    try {
      const { cart_id, product_variant_id, quantity } = createCartItemDto;
      const existsCart = await this.cartRepo.findOne({
        where: { id: cart_id },
      });

      if (!existsCart) {
        throw new NotFoundException(`Cart with ID ${cart_id} not found`);
      }

      const existsProductVariant = await this.productVariantRepo.findOne({
        where: { id: product_variant_id },
      });

      if (!existsProductVariant) {
        throw new NotFoundException(
          `Product variant with ID ${product_variant_id} not found`,
        );
      }

      if (quantity > existsProductVariant.stock) {
        throw new BadRequestException(
          `Quantity should not exceed the main stock`,
        );
      }

      const newCartItem = this.cartItemRepo.create({
        ...createCartItemDto,
        cart: existsCart,
        product_variant: existsProductVariant,
      });

      await this.cartItemRepo.save(newCartItem);

      return successRes(
        {
          id: newCartItem.id,
          cart_id: newCartItem.cart.id,
          product_variant_id: newCartItem.product_variant.id,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allCartItems = await this.cartItemRepo.find({
        relations: ['cart', 'product_variant'],
      });
      return successRes(allCartItems);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
