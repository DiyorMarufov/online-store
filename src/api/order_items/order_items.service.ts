import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { OrderItemsRepo } from 'src/core/repo/order_items.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemRepo: OrderItemsRepo,
  ) {}
  async findAll() {
    try {
      const allOrderItems = await this.orderItemRepo.find();
      return successRes(allOrderItems);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }
}
