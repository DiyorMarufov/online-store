import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesEntity } from 'src/core/entity/favorites.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { TokenService } from 'src/infrastructure/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoritesEntity, UsersEntity, ProductsEntity]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService, TokenService],
})
export class FavoritesModule {}
