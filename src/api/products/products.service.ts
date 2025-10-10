import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { CategoriesRepo } from 'src/core/repo/categories.repo';
import { successRes } from 'src/infrastructure/successResponse';

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

  async findAll() {
    try {
      const allProducts = await this.productRepo.find({
        relations: ['category'],
      });
      return successRes(allProducts);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
