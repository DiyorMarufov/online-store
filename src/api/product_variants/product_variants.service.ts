import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { ProductVariantsRepo } from 'src/core/repo/product_variants.repo';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariantsEntity)
    private readonly productVariantRepo: ProductVariantsRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
  ) {}
  async create(createProductVariantDto: CreateProductVariantDto) {
    try {
      const existsProduct = await this.productRepo.findOne({
        where: { id: createProductVariantDto.product_id },
      });

      if (!existsProduct) {
        throw new NotFoundException(
          `Product with ID ${createProductVariantDto.product_id} not found`,
        );
      }

      const newProduct = this.productVariantRepo.create({
        ...createProductVariantDto,
        product: existsProduct,
      });

      await this.productVariantRepo.save(newProduct);

      return successRes({
        product_id: newProduct.product.id,
        price: newProduct.price,
        stock: newProduct.stock,
        image: newProduct.image,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allProductVariants = await this.productVariantRepo.find({
        relations: ['product'],
      });
      return successRes(allProductVariants);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
