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
}
