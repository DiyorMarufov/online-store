import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MerchantsRepo } from 'src/core/repo/merchants.repo';
import { MerchantsEntity } from 'src/core/entity/merchants.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(MerchantsEntity)
    private readonly merchantRepo: MerchantsRepo,
    @InjectRepository(UsersEntity)
    private readonly userRepo: UsersRepo,
  ) {}
  async create(createMerchantDto: CreateMerchantDto) {
    try {
      const existsMerchant = await this.userRepo.findOne({
        where: { id: createMerchantDto.user_id },
      });

      if (!existsMerchant) {
        throw new NotFoundException(
          `Merchant with ID ${createMerchantDto.user_id} not found `,
        );
      }

      const newMerchant = this.merchantRepo.create(createMerchantDto);

      return successRes({
        store_name: newMerchant.store_name,
        store_logo: newMerchant.store_logo,
        store_description: newMerchant.store_description,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }
}
