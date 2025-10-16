import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { successRes } from 'src/infrastructure/successResponse';
import slugify from 'slugify';
import { FileService } from 'src/infrastructure/file/file.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    private readonly fileService: FileService,
  ) {}
  async create(
    createProductVariantDto: CreateProductVariantDto,
    image?: Express.Multer.File,
  ) {
    try {
      const existsProduct = await this.productRepo.findOne({
        where: { id: createProductVariantDto.product_id },
        relations: [
          'product_variants',
          'product_variants.product_variant_attributes',
          'product_variants.product_variant_attributes.product_values',
          'product_variants.product_variant_attributes.product_attribute',
        ],
      });

      if (!existsProduct) {
        throw new NotFoundException(
          `Product with ID ${createProductVariantDto.product_id} not found`,
        );
      }

      let variant_img: undefined | string;

      if (image) {
        variant_img = await this.fileService.createFile(image);
      }

      const newVariant = this.productVariantRepo.create({
        ...createProductVariantDto,
        product: existsProduct,
        image: variant_img,
      });
      await this.productVariantRepo.save(newVariant);

      let baseSlug = slugify(existsProduct.name, { lower: true, strict: true });

      let uniqueSlug = baseSlug;
      let count = 1;
      while (
        await this.productVariantRepo.findOne({ where: { slug: uniqueSlug } })
      ) {
        uniqueSlug = `${baseSlug}-${count++}`;
      }

      newVariant.slug = uniqueSlug;
      await this.productVariantRepo.save(newVariant);

      return successRes(
        {
          product_id: newVariant.product.id,
          price: newVariant.price,
          stock: newVariant.stock,
          image: newVariant.image,
          slug: newVariant.slug,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductVariants = await this.productVariantRepo
        .createQueryBuilder('pv')
        .leftJoinAndSelect('pv.product', 'products')
        .orderBy('pv.id', 'ASC')
        .getMany();
      return successRes(allProductVariants);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const productVariant = await this.productVariantRepo.findOne({
        where: { id },
        relations: [
          'product',
          'product_variant_attributes',
          'product_variant_attributes.product_attribute',
          'product_variant_attributes.product_values',
        ],
      });

      if (!productVariant) {
        throw new NotFoundException(`Product variant with ID ${id} not found`);
      }

      const formatted = {
        ...productVariant,
        product_variant_attributes:
          productVariant.product_variant_attributes.map((attr) => ({
            id: attr.id,
            created_at: attr.created_at,
            updated_at: attr.updated_at,
            product_attribute: {
              id: attr.product_attribute.id,
              created_at: attr.product_attribute.created_at,
              updated_at: attr.product_attribute.updated_at,
              name: attr.product_attribute.name,
              type: attr.product_attribute.type,
              product_values: attr.product_values.map((v) => ({
                id: v.id,
                created_at: v.created_at,
                updated_at: v.updated_at,
                value: v.value,
              })),
            },
          })),
      };

      return successRes(formatted);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
