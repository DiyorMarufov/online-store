import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesEntity } from 'src/core/entity/favorites.entity';
import { UsersEntity } from 'src/core/entity/users.entity';
import { ProductsEntity } from 'src/core/entity/products.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoritesEntity, UsersEntity, ProductsEntity]),
    TokenModule,
    AuthModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
