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

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity) private readonly orderRepo: OrdersRepo,
    @InjectRepository(UsersEntity) private readonly userRepo: UsersRepo,
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

  async findAllByCustomerId(user: UsersEntity) {
    try {
      const existsUser = await this.userRepo.findOne({
        where: { id: user.id },
      });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }

      const allOrdersByCustomerId = await this.orderRepo
        .createQueryBuilder('o')
        .leftJoinAndSelect('o.address', 'address')
        .leftJoinAndSelect('o.order_items', 'order_items')
        .leftJoinAndSelect('order_items.product_variant', 'product_variant')
        .leftJoinAndSelect('product_variant.images', 'images')
        .leftJoinAndSelect('o.payment', 'payment')
        .where('o.customer.id = :userId', { userId: existsUser.id })
        .select([
          'o.id',
          'o.total_price',
          'o.status',
          'o.created_at',
          'o.updated_at',
          'address.id',
          'address.region',
          'address.city',
          'address.street',
          'address.is_default',
          'order_items.id',
          'order_items.quantity',
          'order_items.price',
          'product_variant.id',
          'product_variant.price',
          'images.id',
          'images.image',
          'payment.id',
          'payment.amount',
          'payment.method',
          'payment.status',
          'payment.transaction_id',
          'payment.created_at',
          'payment.updated_at',
        ])
        .getMany();

      return successRes(allOrdersByCustomerId);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
