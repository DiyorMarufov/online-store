import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { FileModule } from 'src/infrastructure/file/file.module';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, MerchantsEntity]),
    FileModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
})
export class MerchantsModule {}
