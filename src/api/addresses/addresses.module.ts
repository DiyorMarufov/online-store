import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AddressesEntity } from 'src/core/entity/addresses.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, AddressesEntity])],
  controllers: [AddressesController],
  providers: [AddressesService, TokenService],
})
export class AddressesModule {}
