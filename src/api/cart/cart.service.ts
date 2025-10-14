import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from 'src/core/entity/cart.entity';
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
      const allCarts = await this.cartRepo.find({
        relations: ['customer', 'cart_items'],
      });
      return successRes(allCarts);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const cart = await this.cartRepo.findOne({
        where: { id },
        relations: ['customer', 'cart_items'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart with ID ${id} not found`);
      }
      return successRes(cart);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
