import {
  BadRequestException,
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
import { OrdersRepo } from 'src/core/repo/orders.repo';
import { OrdersEntity } from 'src/core/entity/orders.entity';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { OrderItemsRepo } from 'src/core/repo/order_items.repo';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity) private readonly reviewRepo: ReviewsRepo,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    @InjectRepository(ProductsEntity)
    private readonly productRepo: ProductsRepo,
    @InjectRepository(OrdersEntity)
    private readonly orderRepo: OrdersRepo,
    @InjectRepository(OrderItemsEntity)
    private readonly orderItemRepo: OrderItemsRepo,
  ) {}
  async create(createReviewDto: CreateReviewDto) {
    try {
      const { customer_id, product_id, rating, comment } = createReviewDto;

      const existsCustomer = await this.userRepo.findOne({
        where: { id: customer_id },
      });

      if (!existsCustomer) {
        throw new NotFoundException(`User with ID ${customer_id} not found`);
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
        .where('order.customer_id = :customer_id', { customer_id })
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
}
