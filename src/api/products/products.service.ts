import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { CategoriesRepo } from 'src/core/repo/categories.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { Like } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepo: CategoriesRepo,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const existsCategory = await this.categoryRepo.findOne({
        where: { id: createProductDto.category_id },
      });

      if (!existsCategory) {
        throw new NotFoundException(
          `Category with ID ${createProductDto.category_id} not found`,
        );
      }

      const newProduct = this.productRepo.create({
        name: createProductDto.name,
        description: createProductDto.description,
        image: createProductDto.image,
        is_active: createProductDto.is_active,
        category: existsCategory,
      });
      await this.productRepo.save(newProduct);
      return successRes(
        {
          name: newProduct.name,
          description: newProduct.description,
          image: newProduct.image,
          is_active: newProduct.is_active,
          category_id: newProduct.category.id,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll(search?: {
    name?: string;
    description?: string;
    category?: string;
  }) {
    try {
      const query = this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.product_variants', 'variant');

      if (search?.name) {
        query.andWhere('p.name ILIKE :name', { name: `%${search.name}%` });
      }

      if (search?.description) {
        query.andWhere('p.description ILIKE :desc', {
          desc: `%${search.description}%`,
        });
      }

      if (search?.category) {
        query.andWhere('category.name ILIKE :cat', {
          cat: `%${search.category}%`,
        });
      }

      const allProducts = await query.getMany();
      return successRes(allProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
