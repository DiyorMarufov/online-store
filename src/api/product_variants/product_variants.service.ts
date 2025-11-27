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
import { ProductVariantImagesEntity } from 'src/core/entity/product_variant_images.entity';
import { ProductVariantImagesRepo } from 'src/core/repo/product_variant_images.repo';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    @InjectRepository(ProductVariantImagesEntity)
    private readonly productVariantImageRepo: ProductVariantImagesRepo,
    private readonly fileService: FileService,
  ) {}
  async create(
    createProductVariantDto: CreateProductVariantDto,
    images?: Express.Multer.File[],
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

      const variant_imgs: string[] = [];

      if (images?.length) {
        for (const img of images) {
          const savedImage = await this.fileService.createFile(img);
          variant_imgs.push(savedImage);
        }
      }

      const newVariant = this.productVariantRepo.create({
        ...createProductVariantDto,
        product: existsProduct,
      });
      await this.productVariantRepo.save(newVariant);

      if (variant_imgs.length) {
        const variantImageEntities = variant_imgs.map((imgUrl) =>
          this.productVariantImageRepo.create({
            product_variant: newVariant,
            image: imgUrl,
          }),
        );

        await this.productVariantImageRepo.save(variantImageEntities);
        newVariant.images = variantImageEntities;
        await this.productVariantRepo.save(newVariant);
      }

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
      const allProductVariants = await this.productVariantRepo.find({
        relations: ['images', 'merchant_products', 'product'],
        select: {
          id: true,
          product: {
            id: true,
            name: true,
          },
          images: {
            id: true,
            image: true,
          },
          merchant_products: {
            id: true,
          },
          price: true,
          stock: true,
          slug: true,
          created_at: true,
        },
      });
      return successRes(allProductVariants);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForMerchants() {
    try {
      const allProductVariants = await this.productVariantRepo.find({
        relations: [
          'product',
          'product_variant_attributes',
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_variant_attribute_values.value',
          'product_variant_attributes.product_variant_attribute_values.value.product_attribute',
        ],
        select: {
          id: true,
          product: {
            id: true,
            name: true,
            image: true,
          },
          price: true,
          stock: true,
          product_variant_attributes: {
            product_variant_attribute_values: {
              value: {
                product_attribute: {
                  name: true,
                },
                value: true,
              },
            },
          },

          created_at: true,
        },
      });
      return successRes(allProductVariants);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForAdmin(id: number) {
    try {
      const allProductVr = await this.productVariantRepo.find({
        where: {
          product: {
            id,
          },
        },
        relations: [
          'product',
          'product_variant_attributes',
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_variant_attribute_values.value',
          'product_variant_attributes.product_variant_attribute_values.value.product_attribute',
        ],
        select: {
          id: true,
          product: {
            id: true,
            category: {
              id: true,
              name: true,
            },
            name: true,
          },
          price: true,
          stock: true,
          product_variant_attributes: {
            id: true,
            product_variant_attribute_values: {
              id: true,
              value: {
                id: true,
                product_attribute: {
                  id: true,
                  name: true,
                },
                value: true,
              },
            },
          },
          images: {
            id: true,
            image: true,
          },
        },
      });
      return successRes(allProductVr);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOneByIdForAdmin(id: number) {
    try {
      const existsProduct = await this.productVariantRepo.findOne({
        where: { id },
        relations: [
          'product',
          'product.category',
          'merchant_products',
          'merchant_products.merchant',
          'merchant_products.merchant.user',
          'product_variant_attributes',
          'product_variant_attributes.product_variant_attribute_values',
          'product_variant_attributes.product_variant_attribute_values.value',
          'product_variant_attributes.product_variant_attribute_values.value.product_attribute',
        ],
        select: {
          id: true,
          price: true,
          slug: true,
          stock: true,
          product: {
            id: true,
            name: true,
            category: {
              id: true,
              name: true,
            },
            is_active: true,
            average_rating: true,
          },
          merchant_products: {
            id: true,
            merchant: {
              id: true,
              store_name: true,
              user: {
                id: true,
                full_name: true,
                role: true,
              },
            },
          },
          images: {
            id: true,
            image: true,
          },
          product_variant_attributes: {
            id: true,
            product_variant_attribute_values: {
              id: true,
              value: {
                id: true,
                product_attribute: {
                  id: true,
                  name: true,
                },
                value: true,
              },
            },
          },
        },
      });

      if (!existsProduct)
        throw new NotFoundException(`Product variant with ID ${id} not found`);

      return successRes(existsProduct);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(updateProductVariantDto: UpdateProductVariantDto, id: number) {
    try {
      const { product_id, ...updateData } = updateProductVariantDto;
      const existsProductVariant = await this.productVariantRepo.findOne({
        where: { id },
      });

      if (!existsProductVariant) {
        throw new NotFoundException(`Product variant with ID ${id} not found`);
      }

      if (product_id) {
        const existsProduct = await this.productRepo.findOne({
          where: { id: product_id },
        });

        if (!existsProduct) {
          throw new NotFoundException(
            `Product with ID ${product_id} not found`,
          );
        }

        existsProductVariant.product = existsProduct;
      }
      Object.assign(existsProductVariant, updateData);
      await this.productVariantRepo.save(existsProductVariant);
      return successRes({}, 200, 'Product variant successfully updated');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number) {
    try {
      const existsProductVariant = await this.productVariantRepo.findOne({
        where: { id },
      });

      if (!existsProductVariant) {
        throw new NotFoundException(`Product variant with ID ${id} not found`);
      }

      await this.productVariantRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
