import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AddressesEntity } from 'src/core/entity/addresses.entity';
import { CartItemsEntity } from 'src/core/entity/cart_items.entity';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { PaymentEntity } from 'src/core/entity/payment.entity';
import { errorCatch } from 'src/infrastructure/exception';
import { DataSource, In } from 'typeorm';
import { OrdersEntity } from 'src/core/entity/orders.entity';
import { PaymentStatus, UsersRoles } from 'src/common/enum';
import { v4 } from 'uuid';
import { successRes } from 'src/infrastructure/successResponse';
import { OrdersRepo } from 'src/core/repo/orders.repo';
import { ProductVariantsEntity } from 'src/core/entity/product_variants.entity';
import { WalletsEntity } from 'src/core/entity/wallets.entity';
import { UsersRepo } from 'src/core/repo/users.repo';
import { ReviewsEntity } from 'src/core/entity/reviews.entity';
import { ReviewsRepo } from 'src/core/repo/reviews.repo';
import { FavoritesEntity } from 'src/core/entity/favorites.entity';
import { FavoritesRepo } from 'src/core/repo/favorites.repo';
import { CartRepo } from 'src/core/repo/cart.repo';
import { CartEntity } from 'src/core/entity/cart.entity';
import { AddressesRepo } from 'src/core/repo/addresses.repo';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity) private readonly orderRepo: OrdersRepo,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
    @InjectRepository(ReviewsEntity) private readonly reviewRepo: ReviewsRepo,
    @InjectRepository(CartEntity) private readonly cartRepo: CartRepo,
    @InjectRepository(AddressesEntity)
    private readonly addressRepo: AddressesRepo,

    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepo: FavoritesRepo,

    private readonly dataSource: DataSource,
  ) {}
  async create(createOrderDto: CreateOrderDto, user: UsersEntity) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { address_id, cart_items_id, payment_method } = createOrderDto;
      const existsUser = await queryRunner.manager.findOne(UsersEntity, {
        where: { id: user.id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }

      if (existsUser.role !== UsersRoles.CUSTOMER) {
        throw new BadRequestException('Only customer can place orders');
      }

      const existsAddress = await queryRunner.manager.findOne(AddressesEntity, {
        where: {
          id: address_id,
        },
        relations: ['user'],
      });

      if (!existsAddress) {
        throw new NotFoundException(`Address with ID ${address_id} not found`);
      }

      if (existsAddress.user.id !== existsUser.id) {
        throw new BadRequestException(
          `Address does not belong to this user with ID ${existsUser.id}`,
        );
      }

      const existsCartItems = await queryRunner.manager.find(CartItemsEntity, {
        where: { id: In(cart_items_id) },
        relations: ['cart', 'cart.customer', 'product_variant'],
      });

      if (!existsCartItems.length) {
        throw new NotFoundException(`No valid cart items found`);
      }

      for (let item of existsCartItems) {
        if (!item.cart.customer) {
          throw new BadRequestException('Invalid cart item');
        }
      }
      const allBelongToUser = existsCartItems.every(
        (item) => item.cart.customer.id === user.id,
      );

      if (!allBelongToUser) {
        throw new BadRequestException(
          'Some cart items do not belong to this user',
        );
      }

      const total_price = existsCartItems.reduce(
        (acc, item) => acc + item.quantity * item.product_variant.price,
        0,
      );

      const newOrder = queryRunner.manager.create(OrdersEntity, {
        customer: existsUser,
        address: existsAddress,
        total_price,
      });

      await queryRunner.manager.save(OrdersEntity, newOrder);

      const userWallet = await queryRunner.manager.findOne(WalletsEntity, {
        where: { user: { id: user.id } },
      });

      if (!userWallet) {
        throw new NotFoundException(`User's wallet not found`);
      }

      if (total_price > userWallet.balance) {
        throw new BadRequestException(
          `User's balance not enough for purchasing`,
        );
      }

      const newPayment = queryRunner.manager.create(PaymentEntity, {
        order: newOrder,
        amount: total_price,
        method: payment_method,
        status: PaymentStatus.SUCCESS,
        transaction_id: v4(),
      });

      await queryRunner.manager.save(PaymentEntity, newPayment);

      if (newPayment.status !== PaymentStatus.SUCCESS) {
        throw new BadRequestException(`Payment failed`);
      }

      const wallet = await queryRunner.manager.findOne(WalletsEntity, {
        where: { id: userWallet.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      wallet.balance -= total_price;
      await queryRunner.manager.save(WalletsEntity, wallet);

      for (let item of existsCartItems) {
        if (item.quantity > item.product_variant.stock) {
          throw new BadRequestException(
            'Item quantity should not exceed the main stock',
          );
        }
      }

      const newOrderItems = existsCartItems.map((item) => ({
        order: newOrder,
        product_variant: item.product_variant,
        quantity: item.quantity,
        price: item.product_variant.price,
      }));

      await queryRunner.manager.insert(OrderItemsEntity, newOrderItems);

      for (const item of existsCartItems) {
        const productVariant = await queryRunner.manager.findOne(
          ProductVariantsEntity,
          {
            where: { id: item.product_variant.id },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!productVariant) {
          throw new NotFoundException(
            `Product variant with ID ${item.product_variant.id} not found`,
          );
        }

        const newStock = productVariant.stock - item.quantity;

        if (newStock < 0) {
          throw new BadRequestException(
            `Not enough stock for product_variant ID ${productVariant.id}`,
          );
        }

        await queryRunner.manager.update(
          ProductVariantsEntity,
          { id: productVariant.id },
          { stock: newStock },
        );
      }

      await queryRunner.manager.delete(CartItemsEntity, {
        id: In(cart_items_id),
      });

      await queryRunner.commitTransaction();
      return successRes(
        {
          customer_id: newOrder.customer.id,
          address_id: newOrder.address.id,
          total_price: newOrder.total_price,
          status: newOrder.status,
        },
        201,
        'Order created successfully',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return errorCatch(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const allOrders = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .select([
          'order.id',
          'order.total_price',
          'order.status',
          'order.created_at',
          'customer.id',
          'customer.full_name',
        ])
        .getMany();

      return successRes(allOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForMerchants(user: UsersEntity) {
    try {
      const allMerchantOrders = await this.orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.customer', 'customer')
        .leftJoin('customer.merchant', 'merchant')
        .where('customer.id = :id', { id: user.id })
        .select([
          'order.id AS id',
          'customer.full_name AS customer_name',
          'merchant.store_name AS merchant_store_name',
          'merchant.store_description AS merchant_store_description',
          'order.status AS status',
          'order.created_at AS created_at',
        ])
        .getRawMany();

      return successRes(allMerchantOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOrdersForMerchant(user: UsersEntity) {
    try {
      const allMerchantOrders = await this.orderRepo.find({
        where: { customer: { merchant: { id: user.id } } },
        relations: [
          'customer',
          'order_items',
          'order_items.product_variant',
          'order_items.product_variant.product_variant_attributes',
          'order_items.product_variant.product_variant_attributes.product_variant_attribute_values',
          'order_items.product_variant.product_variant_attributes.product_variant_attribute_values.value',
          'order_items.product_variant.product_variant_attributes.product_variant_attribute_values.value.product_attribute',
        ],
        select: {
          id: true,
          created_at: true,
          customer: {
            id: true,
            full_name: true,
          },
          total_price: true,
          payment: {
            id: true,
            amount: true,
          },
          status: true,
          order_items: {
            id: true,
            price: true,
            quantity: true,
            created_at: true,
            product_variant: {
              id: true,
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
          },
        },
      });
      return successRes(allMerchantOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async totalOrders() {
    try {
      const allOrders = await this.orderRepo.count();
      return successRes(allOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async totalOrdersForMerchant(user: UsersEntity) {
    try {
      const totalOrders = await this.orderRepo.count({
        where: {
          customer: {
            merchant: {
              id: user.id,
            },
          },
        },
      });
      return successRes(totalOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllOrdersForCustomer(user: UsersEntity) {
    try {
      const allOrdersOfCustomer = await this.orderRepo.find({
        where: {
          customer: {
            role: UsersRoles.CUSTOMER,
            merchant: {
              id: user.id,
            },
          },
        },
        relations: ['customer', 'customer.orders', 'customer.addresses'],
        select: {
          id: true,
          customer: {
            id: true,
            full_name: true,
            email: true,
            created_at: true,
            orders: {
              id: true,
            },
            addresses: {
              id: true,
              region: true,
            },
          },
          total_price: true,
          created_at: true,
        },
      });
      return successRes(allOrdersOfCustomer);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const existsOrder = await this.orderRepo.findOne({
        where: { id },
      });

      if (!existsOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return successRes(existsOrder);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findCustomerOrdersById(id: number) {
    try {
      const customerOrders = await this.orderRepo.find({
        where: { customer: { id } },
        relations: [
          'order_items',
          'order_items.product_variant',
          'order_items.product_variant.product',
          'payment',
        ],
        select: {
          id: true,
          status: true,
          total_price: true,
          created_at: true,
          order_items: {
            id: true,
            quantity: true,
            product_variant: {
              id: true,
              price: true,
              product: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          payment: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transaction_id: true,
          },
        },
        order: {
          created_at: 'DESC',
        },
      });

      return successRes(customerOrders);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findMerchantOrdersById(id: number) {
    try {
      const orders = await this.orderRepo.find({
        where: {
          order_items: {
            product_variant: {
              merchant_products: {
                merchant: {
                  user: { id },
                },
              },
            },
          },
        },
        relations: {
          payment: true,
          order_items: {
            product_variant: {
              product: true,
            },
          },
        },
        select: {
          id: true,
          status: true,
          total_price: true,
          created_at: true,

          payment: {
            id: true,
            amount: true,
            method: true,
            status: true,
            transaction_id: true,
          },

          order_items: {
            id: true,
            quantity: true,
            product_variant: {
              id: true,
              price: true,
              product: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      });

      return successRes(orders);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
