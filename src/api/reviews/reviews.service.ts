import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepo } from 'src/core/repo/users.repo';
import { UsersEntity } from 'src/core/entity/users.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { ProductsRepo } from 'src/core/repo/products.repo';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { ReviewsRepo } from 'src/core/repo/reviews.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { OrderStatus, UsersRoles } from 'src/common/enum';
import { OrderItemsRepo } from 'src/core/repo/order_items.repo';
import { successRes } from 'src/infrastructure/successResponse';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity) private readonly reviewRepo: ReviewsRepo,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemRepo: OrderItemsRepo,
  ) {}
  async create(createReviewDto: CreateReviewDto, user: UsersEntity) {
    try {
      const { product_id, rating, comment } = createReviewDto;

      const existsCustomer = await this.userRepo.findOne({
        where: { id: user.id },
      });

      if (!existsCustomer) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }

      if (existsCustomer.role !== UsersRoles.CUSTOMER) {
        throw new BadRequestException(`User role must be Customer`);
      }

      const existsProduct = await this.productRepo.findOne({
        where: { id: product_id },
      });

      if (!existsProduct) {
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }

      const hasPurchased = await this.orderItemRepo
        .createQueryBuilder('order_item')
        .innerJoin('order_item.order', 'order')
        .innerJoin('order_item.product_variant', 'product_variant')
        .innerJoin('product_variant.product', 'product')
        .where('order.customer_id = :customer_id', { customer_id: user.id })
        .andWhere('product.id = :product_id', { product_id })
        .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
        .getExists();

      if (!hasPurchased) {
        throw new BadRequestException(
          `User has not purchased this product — review not allowed`,
        );
      }

      const newReview = this.reviewRepo.create({
        customer: existsCustomer,
        product: existsProduct,
        rating,
        comment,
      });

      await this.reviewRepo.save(newReview);

      const { avg } = await this.reviewRepo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .where('r.product_id = :productId', { productId: existsProduct.id })
        .getRawOne();

      await this.productRepo.update(existsProduct.id, {
        average_rating: avg,
      });

      return successRes(
        {
          id: newReview.id,
          customer_id: newReview.customer.id,
          product_id: newReview.product.id,
          rating,
          comment,
        },
        201,
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const allReviews = await this.reviewRepo
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.product', 'product')
        .leftJoin('review.customer', 'customer')
        .addSelect(['customer.id', 'customer.full_name', 'customer.email'])
        .getMany();
      return successRes(allReviews);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllByCustomerId(user: UsersEntity) {
    try {
      const allReviewsByCustomerId = await this.reviewRepo
        .createQueryBuilder('review')
        .leftJoin('review.product', 'product')
        .leftJoin('product.product_variants', 'variant')
        .leftJoin('variant.product_variant_attributes', 'pva')
        .leftJoin('pva.product_attribute', 'attr')
        .leftJoin('pva.product_variant_attribute_values', 'attrValue')
        .addSelect([
          'review.id',
          'review.rating',
          'review.comment',
          'review.created_at',
          'product.id',
          'product.name',
          'variant.id',
          'pva.id',
          'attr.id',
          'attr.name',
          'attrValue.id',
          'attrValue.value',
        ])
        .where('review.customer.id = :customerId', { customerId: user.id })
        .getMany();

      return successRes(allReviewsByCustomerId);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForAdminById(id: number) {
    try {
      const allReviews = await this.reviewRepo.find({
        where: {
          product: {
            id,
          },
        },
        relations: ['customer'],
        select: {
          id: true,
          customer: {
            id: true,
            full_name: true,
          },
          rating: true,
          comment: true,
          created_at: true,
          updated_at: true,
        },
      });
      return successRes(allReviews);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findCustomerReviewsById(id: number) {
    try {
      const reviews = await this.reviewRepo.find({
        where: { customer: { id } },
        relations: ['product'],
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          product: {
            id: true,
            name: true,
            image: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return successRes(reviews);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findMerchantReviewsById(id: number) {
    try {
      const reviews = await this.reviewRepo.find({
        relations: {
          customer: true,
          product: {
            product_variants: {
              merchant_products: {
                merchant: {
                  user: true,
                },
              },
            },
          },
        },

        where: {
          product: {
            product_variants: {
              merchant_products: {
                merchant: {
                  user: {
                    id,
                  },
                },
              },
            },
          },
        },

        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,

          customer: {
            id: true,
            full_name: true,
          },

          product: {
            id: true,
            name: true,
            image: true,

            product_variants: {
              id: true,
              merchant_products: {
                id: true,
                merchant: {
                  id: true,
                  user: {
                    id: true,
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      });

      return successRes(reviews);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(
    updateReviewDto: UpdateReviewDto,
    id: number,
    user: UsersEntity,
  ) {
    try {
      const existsReview = await this.reviewRepo.findOne({
        where: { id },
        relations: ['customer'],
      });

      if (!existsReview) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsReview.customer.id
      ) {
        throw new ForbiddenException(`Can't update other's review`);
      }

      await this.reviewRepo.update(id, updateReviewDto);
      return successRes({}, 200, 'Review updated successfully');
    } catch (error) {
      return errorCatch(error);
    }
  }

  async delete(id: number, user: UsersEntity) {
    try {
      const existsReview = await this.reviewRepo.findOne({
        where: { id },
        relations: ['customer'],
      });

      if (!existsReview) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        user.id !== existsReview.customer.id
      ) {
        throw new ForbiddenException(`Can't delete other's review`);
      }
      await this.reviewRepo.delete(id);
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
