import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { CategoriesRepo } from 'src/core/repo/categories.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepo: CategoriesRepo,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const existsCategory = await this.categoryRepo.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existsCategory) {
        throw new ConflictException(
          `Category with name ${createCategoryDto.name} already exists`,
        );
      }

      const newCategory = this.categoryRepo.create(createCategoryDto);
      await this.categoryRepo.save(newCategory);
      return successRes(newCategory, 201);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allCategories = await this.categoryRepo.find();
      return successRes(allCategories);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
