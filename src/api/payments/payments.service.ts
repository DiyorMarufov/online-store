import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRoles } from 'src/common/enum';
import { PaymentEntity } from 'src/core/entity/payment.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { PaymentRepo } from 'src/core/repo/payment.repo';
import { errorCatch } from 'src/infrastructure/exception';
import { successRes } from 'src/infrastructure/successResponse';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity) private readonly paymentRepo: PaymentRepo,
  ) {}
  async findAll() {
    try {
      const allPayments = await this.paymentRepo.find({
        relations: ['order', 'order.customer'],
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          transaction_id: true,
          created_at: true,

          order: {
            id: true,
            total_price: true,
            status: true,

            customer: {
              id: true,
              full_name: true,
            },
          },
        },
      });

      return successRes(allPayments);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAllForMerchant(user: UsersEntity) {
    try {
      const allPaymentsForMerchant = await this.paymentRepo.find({
        where: {
          order: {
            customer: {
              merchant: {
                id: user.id,
              },
            },
          },
        },
        select: {
          id: true,
          order: {
            id: true,
          },
          amount: true,
          method: true,
          status: true,
          transaction_id: true,
          created_at: true,
        },
      });
      return successRes(allPaymentsForMerchant);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number, user: UsersEntity) {
    try {
      const payment = await this.paymentRepo.findOne({
        where: { id }, // Shart qo'shildi
        relations: [
          // 1. Asosiy bog'lanishlar
          'order',
          'order.customer', // Ruxsatni tekshirish uchun kerak
          'order.address',

          // 2. Order Items va Product Variant zanjiri (Batafsil ma'lumotlar uchun)
          'order.order_items',
          'order.order_items.product_variant',
          'order.order_items.product_variant.images',
          'order.order_items.product_variant.product',

          // 3. Variant Atributlari zanjiri
          'order.order_items.product_variant.product_variant_attributes',
          'order.order_items.product_variant.product_variant_attributes.product_variant_attribute_values',
          'order.order_items.product_variant.product_variant_attributes.product_variant_attribute_values.value',
          'order.order_items.product_variant.product_variant_attributes.product_variant_attribute_values.value.product_attribute',

          // 4. Merchant ma'lumotlari zanjiri
          'order.order_items.product_variant.merchant_products',
          'order.order_items.product_variant.merchant_products.merchant',
          'order.order_items.product_variant.merchant_products.merchant.user',
        ],

        select: {
          // PaymentEntity ning bevosita maydonlari
          id: true,
          amount: true,
          method: true,
          status: true,
          transaction_id: true,
          created_at: true,

          // OrderEntity va unga bog'langan ma'lumotlar (Payment orqali)
          order: {
            id: true,
            total_price: true,
            status: true,

            // Customer - ruxsatni tekshirish uchun zarur
            customer: {
              id: true,
              full_name: true,
            },

            // Manzil ma'lumotlari
            address: {
              id: true,
              city: true,
              region: true,
              street: true,
            },

            // Order Items va uning barcha chuqur ma'lumotlari
            order_items: {
              id: true,
              price: true,
              quantity: true,
              created_at: true,
              product_variant: {
                id: true,
                stock: true,
                images: {
                  id: true,
                  image: true,
                },
                product: {
                  id: true,
                  name: true,
                },
                product_variant_attributes: {
                  id: true,
                  product_variant_attribute_values: {
                    id: true,
                    value: {
                      id: true,
                      value: true,
                      product_attribute: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
                merchant_products: {
                  id: true,
                  merchant: {
                    id: true,
                    store_name: true,
                    verified: true,
                    user: {
                      id: true,
                      full_name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }

      if (
        user.role === UsersRoles.CUSTOMER &&
        payment.order.customer.id !== user.id
      ) {
        throw new ForbiddenException(`You can't access to other's payment`);
      }

      return successRes(payment);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findMerchantPaymentsById(id: number) {
    try {
      const payments = await this.paymentRepo.find({
        where: {
          order: {
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
        },
        relations: {
          order: {
            customer: true,
            order_items: {
              product_variant: {
                product: true,
              },
            },
          },
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true,

          order: {
            id: true,
            customer: {
              id: true,
              full_name: true,
            },
            order_items: {
              id: true,
              product_variant: {
                id: true,
                product: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return successRes(payments);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
