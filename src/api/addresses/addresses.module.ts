import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AddressesEntity } from 'src/core/entity/addresses.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, AddressesEntity]),
    AuthModule,
    TokenModule,
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
