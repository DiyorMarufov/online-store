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
        .leftJoinAndSelect('p.reviews', 'reviews')
        .orderBy('p.id', 'ASC');

      // 🔍 Filtering
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
        query.leftJoin('variant.product_variant_attributes', 'attr');
        query.leftJoin('attr.product_values', 'value');
        query.andWhere('value.value ILIKE :attrValue', {
          attrValue: `%${search.attribute_value}%`,
        });
      }

      switch (search?.sort) {
        case 'cheap':
          query.orderBy('variant.price', 'ASC');
          break;

        case 'expensive':
          query.orderBy('variant.price', 'DESC');
          break;

        case 'most_rated':
          query.orderBy('p.average_rating', 'DESC');
          break;

        case 'recent_products':
          query.orderBy('p.created_at', 'DESC');
          break;

        default:
          query.orderBy('p.id', 'ASC');
          break;
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

  async findProductsByCategoryId(
    category_id: number,
    search?: ProductSearchDto,
  ) {
    try {
      const allCategories = await this.categoryRepo
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.parent', 'parent')
        .leftJoinAndSelect('category.children', 'children')
        .getMany();

      const findAllChildIds = (id: number): number[] => {
        const children = allCategories.filter((c) => c.parent?.id === id);
        let ids = [id];
        for (const child of children) {
          ids = ids.concat(findAllChildIds(child.id));
        }
        return ids;
      };
      const categoryIds = findAllChildIds(Number(category_id))
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));
      const page = search?.page || 1;
      const limit = search?.limit || 10;

      const query = this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.product_variants', 'variant')
        .where('category.id IN (:...ids)', { ids: categoryIds });

      if (search?.name) {
        query.andWhere('p.name ILIKE :name', { name: `%${search.name}%` });
      }

      if (search?.description) {
        query.andWhere('p.description ILIKE :desc', {
          desc: `%${search.description}%`,
        });
      }

      if (search?.attribute_value) {
        query.leftJoin('variant.product_variant_attributes', 'attr');
        query.leftJoin('attr.product_values', 'value');
        query.andWhere('value.value ILIKE :attrValue', {
          attrValue: `%${search.attribute_value}%`,
        });
      }

      switch (search?.sort) {
        case 'cheap':
          query.orderBy('variant.price', 'ASC');
          break;
        case 'expensive':
          query.orderBy('variant.price', 'DESC');
          break;
        case 'most_rated':
          query.orderBy('p.average_rating', 'DESC');
          break;
        case 'recent_products':
          query.orderBy('p.created_at', 'DESC');
          break;
        default:
          query.orderBy('p.id', 'ASC');
          break;
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

  async findProductById(id: number) {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['category', 'product_variants', 'reviews'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return successRes(product);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
