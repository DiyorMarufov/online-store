import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from 'src/core/entity/orders.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersEntity, UsersEntity]),
    TokenModule,
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
