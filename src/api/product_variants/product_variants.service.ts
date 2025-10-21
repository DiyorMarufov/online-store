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
import { index } from 'src/infrastructure/meili-search/meili.search';

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
          'product_variants.product_variant_attributes.product_variant_attribute_values',
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

      const fullProduct = await this.productRepo.findOne({
        where: { id: existsProduct.id },
        relations: [
          'category',
          'product_variants',
          'product_variants.product_variant_attributes',
          'product_variants.product_variant_attributes.product_attribute',
          'product_variants.product_variant_attributes.product_variant_attribute_values',
          'product_variants.product_variant_attributes.product_variant_attribute_values.value',
        ],
      });

      if (!fullProduct) {
        throw new Error('Product not found');
      }

      const firstVariant = fullProduct.product_variants?.[0];

      const productForMeili = {
        id: fullProduct.id,
        name: fullProduct.name,
        description: fullProduct.description,
        image: fullProduct.image,
        is_active: fullProduct.is_active,
        average_rating: fullProduct.average_rating,
        category_id: fullProduct.category?.id,
        attribute_id: fullProduct.product_variants.flatMap((v) =>
          v.product_variant_attributes.map((a) => a.product_attribute.id),
        ),
        attribute_value_id: fullProduct.product_variants.flatMap((v) =>
          v.product_variant_attributes.flatMap((a) =>
            a.product_variant_attribute_values.map((val) => val.value.id),
          ),
        ),
        created_at: fullProduct.created_at,
        price: firstVariant ? firstVariant.price : 0,
      };
      await index.addDocuments([productForMeili]);
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
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_variant_attribute_values.value',
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
            product_attribute: {
              id: attr.product_attribute.id,
              name: attr.product_attribute.name,
              type: attr.product_attribute.type,
              product_attribute_values:
                attr.product_variant_attribute_values.map((v) => ({
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
