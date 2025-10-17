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
import { FileService } from 'src/infrastructure/file/file.service';
import { ProductSearchByCategoryDto } from './dto/search-product-bycategorty.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepo: CategoriesRepo,
    private readonly fileService: FileService,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    image?: Express.Multer.File,
  ) {
    try {
      const existsCategory = await this.categoryRepo.findOne({
        where: { id: createProductDto.category_id },
      });

      if (!existsCategory) {
        throw new NotFoundException(
          `Category with ID ${createProductDto.category_id} not found`,
        );
      }

      let cover_image: undefined | string;

      if (image) {
        cover_image = await this.fileService.createFile(image);
      }

      const newProduct = this.productRepo.create({
        name: createProductDto.name,
        description: createProductDto.description,
        image: cover_image,
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

      if (search?.name) {
        query.andWhere('p.name ILIKE :name', { name: `%${search.name}%` });
      }

      if (search?.description) {
        query.andWhere('p.description ILIKE :desc', {
          desc: `%${search.description}%`,
        });
      }

      if (search?.category_id) {
        query.andWhere('category.id = :categoryId', {
          categoryId: search.category_id,
        });
      }

      if (search?.attribute_id) {
        query.leftJoin('variant.product_variant_attributes', 'attr_values');
        query.leftJoin('attr_values.product_attribute', 'attr');
        query.andWhere('attr.id = :attributeId', {
          attributeId: search.attribute_id,
        });
      }

      if (search?.attribute_value_id) {
        query.leftJoin('variant.product_variant_attributes', 'attr_values');
        query.leftJoin('attr_values.product_values', 'value');
        query.andWhere('value.id = :attributeValueId', {
          attributeValueId: search.attribute_value_id,
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
    search?: ProductSearchByCategoryDto,
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

      if (search?.attribute_id) {
        query.leftJoin('variant.product_variant_attributes', 'attr_values');
        query.leftJoin('attr_values.product_attribute', 'attr');
        query.andWhere('attr.id = :attributeId', {
          attributeId: search.attribute_id,
        });
      }

      if (search?.attribute_value_id) {
        query.leftJoin('variant.product_variant_attributes', 'attr_values');
        query.leftJoin('attr_values.product_values', 'value');
        query.andWhere('value.id = :attributeValueId', {
          attributeValueId: search.attribute_value_id,
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
        relations: [
          'category',
          'product_variants',
          'product_variants.product_variant_attributes',
          'product_variants.product_variant_attributes.product_attribute',
          'product_variants.product_variant_attributes.product_values',
          'reviews',
        ],
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
