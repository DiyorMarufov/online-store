import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoritesEntity } from 'src/core/entity/favorites.entity';
import { FavoritesRepo } from 'src/core/repo/favorites.repo';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';
import { UsersRoles } from 'src/common/enum';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoriteRepo: FavoritesRepo,
    @InjectRepository(UsersEntity)
    private readonly userRepo: UsersRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
  ) {}
  async create(createFavoriteDto: CreateFavoriteDto) {
    try {
      const { customer_id, product_id } = createFavoriteDto;
      const existsCustomer = await this.userRepo.findOne({
        where: { id: customer_id },
      });

      if (!existsCustomer) {
        throw new NotFoundException(`User with ID ${customer_id} not found`);
      }

      if (existsCustomer.role !== UsersRoles.CUSTOMER) {
        throw new BadRequestException('User role must be CUSTOMER');
      }

      const existsProduct = await this.productRepo.findOne({
        where: { id: product_id },
      });

      if (!existsProduct) {
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }

      const newFavorite = this.favoriteRepo.create({
        customer: existsCustomer,
        product: existsProduct,
      });

      await this.favoriteRepo.save(newFavorite);

      return successRes(
        {
          id: newFavorite.id,
          customer_id: newFavorite.customer.id,
          product_id: newFavorite.product.id,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allFavorites = await this.favoriteRepo.find({
        relations: ['customer', 'product'],
      });
      return successRes(allFavorites);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
