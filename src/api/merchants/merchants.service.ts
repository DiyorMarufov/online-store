import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantsRepo } from 'src/core/repo/merchants.repo';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { UsersRoles } from 'src/common/enum';
import { FileService } from 'src/infrastructure/file/file.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(MerchantsEntity)
    private readonly merchantRepo: MerchantsRepo,
    @InjectRepository(UsersEntity)
    private readonly userRepo: UsersRepo,
    private readonly fileService: FileService,
  ) {}
  async create(
    createMerchantDto: CreateMerchantDto,
    user: UsersEntity,
    image?: Express.Multer.File,
  ) {
    try {
      const existsMerchant = await this.userRepo.findOne({
        where: { id: user.id, role: UsersRoles.MERCHANT },
      });

      if (!existsMerchant) {
        throw new NotFoundException(`Merchant with ID ${user.id} not found `);
      }

      let merchant_store_logo: undefined | string;

      if (image) {
        merchant_store_logo = await this.fileService.createFile(image);
      }

      const newMerchant = this.merchantRepo.create({
        ...createMerchantDto,
        user: existsMerchant,
        store_logo: merchant_store_logo,
      });
      await this.merchantRepo.save(newMerchant);
      return successRes(
        {
          id: newMerchant.id,
          user: newMerchant.user.id,
          store_name: newMerchant.store_name,
          store_logo: newMerchant.store_logo,
          store_description: newMerchant.store_description,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allMerchants = await this.merchantRepo.find();
      return successRes(allMerchants);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async totalMerchantStores() {
    try {
      const allMerchantStores = await this.merchantRepo.count();
      return successRes(allMerchantStores);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllByMerchantId(user: UsersEntity) {
    try {
      const allMerchantStores = await this.merchantRepo.find({
        where: { user: { id: user.id } },
        relations: ['merchant_products'],
      });
      return successRes(allMerchantStores);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number, user: UsersEntity) {
    try {
      const existsMerchant = await this.merchantRepo
        .createQueryBuilder('m')
        .leftJoin('m.user', 'u')
        .leftJoinAndSelect('m.merchant_products', 'mp')
        .addSelect(['u.id', 'u.full_name', 'u.email'])
        .where('m.id = :id', { id })
        .getOne();

      if (!existsMerchant) {
        throw new NotFoundException(`Merchant with ID ${id} not found`);
      }
      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchant.user.id
      ) {
        throw new ForbiddenException(
          'You are not allowed to get a store for another merchant',
        );
      }

      return successRes(existsMerchant);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateMerchantDto: UpdateMerchantDto,
    id: number,
    user: UsersEntity,
  ) {
    try {
      const existsMerchantStore = await this.merchantRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existsMerchantStore) {
        throw new NotFoundException(`Merchant store with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchantStore.user.id
      ) {
        throw new ForbiddenException(`Can't update other's store`);
      }

      await this.merchantRepo.update(id, updateMerchantDto);
      return successRes({}, 200, 'Merchant store updated successfully');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number, user: UsersEntity) {
    try {
      const existsMerchantStore = await this.merchantRepo.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!existsMerchantStore) {
        throw new NotFoundException(`Merchant store with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.MERCHANT &&
        user.id !== existsMerchantStore.user.id
      ) {
        throw new ForbiddenException(`Can't delete other's store`);
      }

      await this.merchantRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
