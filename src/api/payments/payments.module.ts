import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from 'src/core/entity/payment.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, TokenService],
})
export class PaymentsModule {}
