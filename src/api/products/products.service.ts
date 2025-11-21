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
import { UpdateProductDto } from './dto/update-product.dto';
import { index } from 'src/infrastructure/meili-search/meili.search';

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
      await index.addDocuments([newProduct]);
      return successRes({}, 201, 'New product successfully created');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll(search?: ProductSearchDto) {
    try {
      const page = search?.page || 1;
      const limit = search?.limit || 10;

      const meiliQuery = search?.name || '';
      const filter: string[] = [];

      if (search?.category_id) {
        filter.push(`category_id = ${search.category_id}`);
      }

      if (search?.attribute_id) {
        filter.push(`attribute_id = ${search.attribute_id}`);
      }

      if (search?.attribute_value_id) {
        filter.push(`attribute_value_id = ${search.attribute_value_id}`);
      }

      let sort: string[] = [];
      switch (search?.sort) {
        case 'cheap':
          sort = ['price:asc'];
          break;
        case 'expensive':
          sort = ['price:desc'];
          break;
        case 'most_rated':
          sort = ['average_rating:desc'];
          break;
        case 'recent_products':
          sort = ['created_at:desc'];
          break;
      }

      const results = await index.search(meiliQuery, {
        limit,
        offset: (page - 1) * limit,
        filter: filter.length ? filter : undefined,
        sort: sort.length ? sort : undefined,
      });
      return successRes({
        data: results.hits,
        meta: {
          total: results.estimatedTotalHits,
          page,
          limit,
          last_page: Math.ceil(results.estimatedTotalHits / limit),
        },
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findProductsForAdmin() {
    try {
      const products = await this.productRepo.find({
        relations: {
          category: {
            parent: true,
          },
          product_variants: true,
        },
        select: {
          id: true,
          image: true,
          name: true,
          description: true,
          is_active: true,
          created_at: true,

          category: {
            id: true,
            name: true,
            parent: {
              id: true,
              name: true,
            },
          },

          product_variants: {
            id: true,
            price: true,
            stock: true,
          },
        },
      });

      return successRes(products);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findProductsByCategoryId(
    category_id: number,
    search?: ProductSearchByCategoryDto,
  ) {
    try {
      const page = search?.page || 1;
      const limit = search?.limit || 10;
      const meiliQuery = search?.name || '';

      const filter: string[] = [];

      const allCategories = await this.categoryRepo.find({
        relations: ['parent', 'children'],
      });

      const findAllChildIds = (id: number): number[] => {
        const children = allCategories.filter((c) => c.parent?.id === id);
        let ids = [id];
        for (const child of children) {
          ids = ids.concat(findAllChildIds(child.id));
        }
        return ids;
      };
      const categoryIds = findAllChildIds(Number(category_id)).filter(
        (id) => !isNaN(id),
      );
      if (categoryIds.length) {
        const categoryFilter = categoryIds
          .map((id) => `category_id = ${id}`)
          .join(' OR ');
        filter.push(categoryFilter);
      }

      if (search?.attribute_id) {
        filter.push(`attribute_id = ${search.attribute_id}`);
      }

      if (search?.attribute_value_id) {
        filter.push(`attribute_value_id = ${search.attribute_value_id}`);
      }

      if (search?.description) {
        filter.push(`description = "${search.description}"`);
      }

      let sort: string[] = [];
      switch (search?.sort) {
        case 'cheap':
          sort = ['price:asc'];
          break;
        case 'expensive':
          sort = ['price:desc'];
          break;
        case 'most_rated':
          sort = ['average_rating:desc'];
          break;
        case 'recent_products':
          sort = ['created_at:desc'];
          break;
        default:
          sort = ['id:asc'];
          break;
      }
      const results = await index.search(meiliQuery, {
        limit,
        offset: (page - 1) * limit,
        filter: filter.length ? filter : undefined,
        sort: sort.length ? sort : undefined,
      });

      return successRes({
        data: results.hits,
        meta: {
          total: results.estimatedTotalHits,
          page,
          limit,
          last_page: Math.ceil(results.estimatedTotalHits / limit),
        },
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAdminProductById(id: number) {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['category', 'product_variants'],
        select: {
          id: true,
          name: true,
          category: {
            id: true,
            name: true,
          },
          average_rating: true,
          product_variants: {
            id: true,
            price: true,
          },
          is_active: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return successRes(product);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(updateProductDto: UpdateProductDto, id: number) {
    try {
      const existsProduct = await this.productRepo.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!existsProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      let category = existsProduct.category;

      if (updateProductDto.category_id) {
        const existsCategory = await this.categoryRepo.findOne({
          where: { id: updateProductDto.category_id },
        });

        if (!existsCategory) {
          throw new NotFoundException(
            `Category with ID ${updateProductDto.category_id} not found`,
          );
        }

        category = existsCategory;
      }

      await this.productRepo.save({
        ...existsProduct,
        ...updateProductDto,
        category,
      });

      return successRes({}, 200, 'Product successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number) {
    try {
      const existsProduct = await this.productRepo.findOne({
        where: { id },
      });

      if (!existsProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.productRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
