import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRoles } from 'src/common/enum';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
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

  async findOne(id: number, user: UsersEntity) {
    try {
      const existsOrderItem = await this.orderItemRepo
        .createQueryBuilder('orderItem')
        .leftJoinAndSelect('orderItem.order', 'order')
        .leftJoin('order.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .where('orderItem.id = :id', { id })
        .getOne();

      if (!existsOrderItem) {
        throw new NotFoundException(`Order item with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        existsOrderItem.order.customer.id !== user.id
      ) {
        throw new ForbiddenException(
          `You don't have access to this order item`,
        );
      }

      return successRes(existsOrderItem);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
