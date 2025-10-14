import { Controller, Get, Post, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product to favorites' })
  @ApiBody({ type: CreateFavoriteDto })
  @ApiResponse({
    status: 201,
    description: 'The product has been added to favorites',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: 1,
          customer_id: 1,
          product_id: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer or product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role for customer',
    schema: {
      example: {
        statusCode: 400,
        message: 'Role is not customer',
        error: 'Bad Request',
      },
    },
  })
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorite products' })
  @ApiResponse({
    status: 200,
    description: 'List of all favorite products',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            customer_id: 1,
            product_id: 2,
            created_at: '2025-10-14T12:00:00.000Z',
          },
          {
            id: 2,
            customer_id: 1,
            product_id: 3,
            created_at: '2025-10-14T12:05:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.favoritesService.findAll();
  }
}
