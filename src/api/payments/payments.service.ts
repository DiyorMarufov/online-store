import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRoles } from 'src/common/enum';
import { PaymentEntity } from 'src/core/entity/payment.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { PaymentRepo } from 'src/core/repo/payment.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity) private readonly paymentRepo: PaymentRepo,
  ) {}
  async findAll() {
    try {
      const allPayments = await this.paymentRepo.find({ relations: ['order'] });
      return successRes(allPayments);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number, user: UsersEntity) {
    try {
      const payment = await this.paymentRepo
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.order', 'order')
        .leftJoin('order.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .where('payment.id = :id', { id })
        .getOne();

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        payment.order.customer.id !== user.id
      ) {
        throw new ForbiddenException(`You can't access to other's payment`);
      }
      return successRes(payment);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
