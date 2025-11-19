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
      const allPayments = await this.paymentRepo
        .createQueryBuilder('payment')
        .leftJoin('payment.order', 'order')
        .leftJoin('order.customer', 'customer')
        .leftJoin('customer.wallets', 'wallet')
        .select([
          'payment.id',
          'payment.created_at',
          'payment.amount',
          'order.status',
          'customer.full_name',
          'wallet.balance',
        ])
        .getMany();

      return successRes(allPayments);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForMerchant(user: UsersEntity) {
    try {
      const allPaymentsForMerchant = await this.paymentRepo.find({
        where: {
          order: {
            customer: {
              merchant: {
                id: user.id,
              },
            },
          },
        },
        select: {
          id: true,
          order: {
            id: true,
          },
          amount: true,
          method: true,
          status: true,
          transaction_id: true,
          created_at: true,
        },
      });
      return successRes(allPaymentsForMerchant);
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

  async findMerchantPaymentsById(id: number) {
    try {
      const payments = await this.paymentRepo.find({
        where: {
          order: {
            order_items: {
              product_variant: {
                merchant_products: {
                  merchant: {
                    user: { id },
                  },
                },
              },
            },
          },
        },
        relations: {
          order: {
            customer: true,
            order_items: {
              product_variant: {
                product: true,
              },
            },
          },
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true,

          order: {
            id: true,
            customer: {
              id: true,
              full_name: true,
            },
            order_items: {
              id: true,
              product_variant: {
                id: true,
                product: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return successRes(payments);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
