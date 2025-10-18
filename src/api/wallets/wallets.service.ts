import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletsRepo } from 'src/core/repo/wallets.repo';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { UsersRoles } from 'src/common/enum';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletsEntity) private readonly walletRepo: WalletsRepo,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
  ) {}
  async create(createWalletDto: CreateWalletDto, user: UsersEntity) {
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
        throw new BadRequestException('User role must be customer or merchant');
      }
      const newWallet = this.walletRepo.create({
        ...createWalletDto,
        user: existsUser,
      });

      await this.walletRepo.save(newWallet);
      return successRes(
        {
          user_id: newWallet.user.id,
          balance: newWallet.balance,
          currency: newWallet.currency,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allWallets = await this.walletRepo
        .createQueryBuilder('wallet')
        .leftJoinAndSelect('wallet.user', 'user')
        .select(['wallet', 'user.full_name', 'user.email'])
        .getMany();
      return successRes(allWallets);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
