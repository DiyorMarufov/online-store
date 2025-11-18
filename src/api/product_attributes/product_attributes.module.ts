import { Module } from '@nestjs/common';
import { ProductAttributesService } from './product_attributes.service';
import { ProductAttributesController } from './product_attributes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributesEntity } from 'src/core/entity/product_attributes.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductAttributesEntity, UsersEntity]),
    TokenModule,
    AuthModule,
  ],
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService],
})
export class ProductAttributesModule {}
