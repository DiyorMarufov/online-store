import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantsRepo } from 'src/core/repo/merchants.repo';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { UsersRoles } from 'src/common/enum';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(MerchantsEntity)
    private readonly merchantRepo: MerchantsRepo,
    @InjectRepository(UsersEntity)
    private readonly userRepo: UsersRepo,
  ) {}
  async create(createMerchantDto: CreateMerchantDto, user: UsersEntity) {
    try {
      const existsMerchant = await this.userRepo.findOne({
        where: { id: user.id, role: UsersRoles.MERCHANT },
      });

      if (!existsMerchant) {
        throw new NotFoundException(`Merchant with ID ${user.id} not found `);
      }

      const newMerchant = this.merchantRepo.create(createMerchantDto);
      await this.merchantRepo.save(newMerchant);
      return successRes({
        id: newMerchant.id,
        store_name: newMerchant.store_name,
        store_logo: newMerchant.store_logo,
        store_description: newMerchant.store_description,
      });
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
}
