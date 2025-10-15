import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from 'src/core/entity/payment.entity';
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

  async findOne(id: number) {
    try {
      const payment = await this.paymentRepo.findOne({
        where: { id },
        relations: ['order'],
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      return successRes(payment);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
