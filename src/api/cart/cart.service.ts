import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRoles } from 'src/common/enum';
import { CartEntity } from 'src/core/entity/cart.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { CartRepo } from 'src/core/repo/cart.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepo,
  ) {}
  async findAll() {
    try {
      const allCarts = await this.cartRepo
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoin('cart.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .getMany();
      return successRes(allCarts);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number, user: UsersEntity) {
    try {
      const cart = await this.cartRepo
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoin('cart_items.product_variant', 'pv')
        .addSelect(['pv.id', 'pv.price', 'pv.stock'])
        .leftJoin('pv.product', 'pvp')
        .addSelect(['pvp.id', 'pvp.name', 'pvp.description', 'pvp.image'])
        .leftJoin('cart.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .where('cart.id = :id', { id })
        .getOne();

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${id} not found`);
      }
      if (user.role === UsersRoles.CUSTOMER && cart.customer.id !== user.id) {
        throw new ForbiddenException(`You can't access to other's cart`);
      }

      return successRes(cart);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOneByCustomerId(user: UsersEntity) {
    try {
      const cart = await this.cartRepo
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.cart_items', 'cart_items')
        .leftJoin('cart_items.product_variant', 'pv')
        .addSelect(['pv.id', 'pv.price', 'pv.stock'])
        .leftJoin('pv.product', 'pvp')
        .addSelect(['pvp.id', 'pvp.name', 'pvp.description', 'pvp.image'])
        .leftJoin('cart.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .where('cart.customer.id = :id', { id: user.id })
        .getOne();

      return successRes(cart);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findCustomerCartById(id: number) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { customer: { id } },
        relations: [
          'cart_items',
          'cart_items.product_variant',
          'cart_items.product_variant.product',
        ],
        select: {
          id: true,
          cart_items: {
            id: true,
            quantity: true,
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
        },
      });

      return successRes(cart);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
