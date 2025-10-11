import { Module } from '@nestjs/common';
import { ProductAttributesService } from './product_attributes.service';
import { ProductAttributesController } from './product_attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ProductAttributesEntity])],
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService, TokenService],
})
export class ProductAttributesModule {}
