import {
  BadRequestException,
  ForbiddenException,
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
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRoles } from 'src/common/enum';

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
  async create(createCartItemDto: CreateCartItemDto, user: UsersEntity) {
    try {
      const { cart_id, product_variant_id, quantity } = createCartItemDto;
      const existsCart = await this.cartRepo.findOne({
        where: { id: cart_id },
        relations: ['customer'],
      });
      if (!existsCart) {
        throw new NotFoundException(`Cart with ID ${cart_id} not found`);
      }
      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsCart.customer.id
      ) {
        throw new ForbiddenException(`Can't create cart item`);
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

  async findOne(id: number, user: UsersEntity) {
    try {
      const existsCartItems = await this.cartItemRepo
        .createQueryBuilder('cartItem')
        .leftJoin('cartItem.cart', 'cart')
        .leftJoin('cart.customer', 'customer')
        .addSelect(['cart.id'])
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .where('cartItem.id = :id', { id })
        .getOne();

      if (!existsCartItems) {
        throw new NotFoundException(`Cart item with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsCartItems.cart.customer.id
      ) {
        throw new ForbiddenException(`Can't get other's cart items`);
      }

      return successRes(existsCartItems);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateCartItemDto: UpdateCartItemDto,
    id: number,
    user: UsersEntity,
  ) {
    try {
      const { cart_id, product_variant_id, quantity } = updateCartItemDto;

      if (cart_id || product_variant_id) {
        throw new BadRequestException(
          `Can't update other fields except quantity`,
        );
      }

      const existsCartItem = await this.cartItemRepo.findOne({
        where: { id },
        relations: ['cart', 'cart.customer'],
      });

      if (!existsCartItem) {
        throw new NotFoundException(`Cart item with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsCartItem.cart.customer.id
      ) {
        throw new ForbiddenException(`Can't update other's cart items`);
      }

      await this.cartItemRepo.update(id, {
        quantity,
      });
      return successRes({}, 200, 'Cart item updated successfully');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number, user: UsersEntity) {
    try {
      const existsCartItem = await this.cartItemRepo.findOne({
        where: { id },
        relations: ['cart', 'cart.customer'],
      });
      if (!existsCartItem) {
        throw new NotFoundException(`Cart item with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsCartItem.cart.customer.id
      ) {
        throw new ForbiddenException(`Can't delete other's cart items`);
      }

      await this.cartItemRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
