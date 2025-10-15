import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ProductAttributeValuesModule } from './product_attribute_values/product_attribute_values.module';
import { ProductAttributesModule } from './product_attributes/product_attributes.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { MerchantProductsModule } from './merchant_products/merchant_products.module';
import { AddressesModule } from './addresses/addresses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ProductVariantsModule } from './product_variants/product_variants.module';
import { ProductVariantsAttributesModule } from './product_variants_attributes/product_variants_attributes.module';
import config from 'src/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: true,
      autoLoadEntities: true,
      entities: ['dist/core/entity/*.entity{.ts,.js}'],
    }),
    JwtModule.register({ global: true }),
    CategoriesModule,
    UsersModule,
    ProductsModule,
    ProductAttributeValuesModule,
    ProductAttributesModule,
    CartItemsModule,
    MerchantProductsModule,
    AddressesModule,
    ReviewsModule,
    OrderItemsModule,
    OrdersModule,
    CartModule,
    FavoritesModule,
    MerchantsModule,
    ProductVariantsModule,
    ProductVariantsAttributesModule,
    PaymentsModule,
  ],
})
export class AppModule {}
