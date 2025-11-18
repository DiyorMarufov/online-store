import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesEntity } from 'src/core/entity/categories.entity';
import { TokenModule } from 'src/infrastructure/jwt/token.module';
import { AuthModule } from 'src/common/guard/auth-guard/auth-guard.module';
import { UsersEntity } from 'src/core/entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoriesEntity, UsersEntity]),
    AuthModule,
    TokenModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
