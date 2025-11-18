import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from 'src/core/entity/payment.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, UsersEntity]),
    TokenModule,
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
