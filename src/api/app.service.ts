import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import config from 'src/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './product_variants/product_variants.module';
import { MerchantsModule } from './merchants/merchants.module';
import { MerchantProductsModule } from './merchant_products/merchant_products.module';
import { ProductAttributesModule } from './product_attributes/product_attributes.module';
import { ProductAttributeValuesModule } from './product_attribute_values/product_attribute_values.module';
import { ProductVariantsAttributesModule } from './product_variants_attributes/product_variants_attributes.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CartModule } from './cart/cart.module';
import { CartItemsModule } from './cart_items/cart_items.module';

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Online store example')
      .setDescription('The online store API description')
      .setVersion('1.0')
      .addTag('Online store')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token, example: Bearer <your_token>',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      include: [
        UsersModule,
        CategoriesModule,
        ProductsModule,
        ProductVariantsModule,
        MerchantsModule,
        MerchantProductsModule,
        ProductAttributesModule,
        ProductAttributeValuesModule,
        ProductVariantsAttributesModule,
        FavoritesModule,
        CartModule,
        CartItemsModule,
      ],
    });
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.listen(config.PORT, () =>
      console.log(`Server is running on port`, config.PORT),
    );
  }
}
