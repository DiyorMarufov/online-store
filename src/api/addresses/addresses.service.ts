import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { AddressesEntity } from 'src/core/entity/addresses.entity';
import { AddressesRepo } from 'src/core/repo/addresses.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';
import { UsersRoles } from 'src/common/enum';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    @InjectRepository(AddressesEntity)
    private readonly addressRepo: AddressesRepo,
  ) {}
  async create(createAddressDto: CreateAddressDto, user: UsersEntity) {
    try {
      const existsUser = await this.userRepo.findOne({
        where: { id: user.id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }

      if (
        existsUser.role !== UsersRoles.CUSTOMER &&
        existsUser.role !== UsersRoles.MERCHANT
      ) {
        throw new BadRequestException(`User role must be CUSTOMER or MERCHANT`);
      }

      const newAddress = this.addressRepo.create({
        ...createAddressDto,
        user: existsUser,
      });

      await this.addressRepo.save(newAddress);
      return successRes(
        {
          id: newAddress.id,
          user_id: newAddress.user.id,
          region: newAddress.region,
          city: newAddress.city,
          street: newAddress.street,
          is_default: newAddress.is_default,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allAddresses = await this.addressRepo.find();
      return successRes(allAddresses);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number, user: UsersEntity) {
    try {
      const existsAddress = await this.addressRepo
        .createQueryBuilder('address')
        .leftJoinAndSelect('address.user', 'user')
        .where('address.id = :id', { id })
        .select(['address', 'user.id', 'user.full_name', 'user.email'])
        .getOne();

      if (!existsAddress) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        existsAddress.user.id !== user.id
      ) {
        throw new ForbiddenException(`Can't get other's address`);
      }

      return successRes(existsAddress);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateAddressDto: UpdateAddressDto,
    id: number,
    user: UsersEntity,
  ) {
    try {
      const existsAddress = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existsAddress) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        existsAddress.user.id !== user.id
      ) {
        throw new ForbiddenException(`Can't update other's address`);
      }

      await this.addressRepo.update(id, updateAddressDto);
      return successRes({}, 200, 'Address successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number, user: UsersEntity) {
    try {
      const existsAddress = await this.addressRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existsAddress) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        existsAddress.user.id !== user.id
      ) {
        throw new ForbiddenException(`Can't delete other's address`);
      }
      await this.addressRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
