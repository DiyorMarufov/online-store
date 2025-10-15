import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { CategoriesRepo } from 'src/core/repo/categories.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { ProductSearchDto } from './dto/search-product.dto';

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

  async findAll(search?: ProductSearchDto) {
    try {
      const page = search?.page || 1;
      const limit = search?.limit || 10;

      const query = this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.product_variants', 'variant')
        .leftJoinAndSelect('p.reviews', 'reviews');

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

      if (search?.attribute_value) {
        query.leftJoin('variant.attribute_values', 'attr');
        query.andWhere('attr.value ILIKE :attrValue', {
          attrValue: `%${search.attribute_value}%`,
        });
      }

      const orderConditions: { [key: string]: 'ASC' | 'DESC' } = {};

      if (search?.popular) {
        query.leftJoinAndSelect('p.favorites', 'favorites');
        query.groupBy('p.id');
        orderConditions['COUNT(favorites.id)'] = 'DESC';
      }

      if (search?.most_rated) {
        orderConditions['p.average_rating'] = search.most_rated
          ? 'DESC'
          : 'ASC';
      }

      if (search?.cheap) {
        orderConditions['variant.price'] = 'ASC';
      }

      if (search?.expensive) {
        orderConditions['variant.price'] = 'DESC';
      }

      if (search?.recent_orders) {
        query
          .leftJoin('p.product_variants', 'product_variants')
          .leftJoin('p.product_variants.order_items', 'order_items')
          .orderBy('MAX(order_items.created_at)', 'DESC')
          .groupBy('p.id');
      }

      if (Object.keys(orderConditions).length > 0) {
        const [firstKey, firstValue] = Object.entries(orderConditions)[0];
        query.orderBy(firstKey, firstValue as 'ASC' | 'DESC');
        Object.entries(orderConditions)
          .slice(1)
          .forEach(([key, value]) => {
            query.addOrderBy(key, value as 'ASC' | 'DESC');
          });
      }

      query.skip((page - 1) * limit).take(limit);

      const [products, total] = await query.getManyAndCount();

      return successRes({
        data: products,
        meta: {
          total,
          page,
          limit,
          last_page: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return errorCatch(error);
    }
  }
}
