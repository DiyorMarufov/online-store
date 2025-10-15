import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
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
      const { name, parent_id } = createCategoryDto;
      const existsCategory = await this.categoryRepo.findOne({
        where: { name },
      });

      if (existsCategory) {
        throw new ConflictException(
          `Category with name ${createCategoryDto.name} already exists`,
        );
      }

      const newCategory = this.categoryRepo.create(createCategoryDto);

      if (parent_id) {
        const parentCategory = await this.categoryRepo.findOne({
          where: { id: parent_id },
        });

        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${parent_id} not found`,
          );
        }
        newCategory.parent = parentCategory;
      }

      await this.categoryRepo.save(newCategory);
      return successRes(
        {
          name: newCategory.name,
          parent_id: newCategory.parent?.id || null,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepo
        .createQueryBuilder('category')
        .innerJoinAndSelect('category.children', 'children')
        .innerJoinAndSelect('children.products', 'products')
        .leftJoinAndSelect('category.parent', 'parent')
        .getMany();

      return successRes(categories);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number) {
    try {
      const category = await this.categoryRepo.findOne({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      await this.categoryRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
