import { Module } from '@nestjs/common';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { ProductAttributeValuesController } from './product_attribute_values.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { ProductAttributeValuesEntity } from 'src/core/entity/product_attribute_values.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductAttributesEntity,
      ProductAttributeValuesEntity,
      UsersEntity,
    ]),
    TokenModule,
    AuthModule,
  ],
  controllers: [ProductAttributeValuesController],
  providers: [ProductAttributeValuesService],
})
export class ProductAttributeValuesModule {}
