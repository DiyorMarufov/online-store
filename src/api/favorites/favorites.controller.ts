import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Add a product to favorites (Customer only)' })
  @ApiBody({ type: CreateFavoriteDto })
  @ApiCreatedResponse({
    description: 'The product has been added to favorites',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Product added to favorites successfully',
        data: {
          id: 1,
          customer_id: 1,
          product_id: 2,
          created_at: '2025-10-14T12:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or role',
    schema: {
      example: {
        statusCode: 400,
        message: 'Role is not customer',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Customer or product not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product with ID 2 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
  })
  create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.favoritesService.create(createFavoriteDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all favorite products (Admin only)' })
  @ApiOkResponse({
    description: 'List of all favorite products returned successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            customer: {
              id: 1,
              full_name: 'John Doe',
              email: 'john@example.com',
            },
            product_id: 2,
            created_at: '2025-10-14T12:00:00.000Z',
          },
          {
            id: 2,
            customer: {
              id: 2,
              full_name: 'Jane Smith',
              email: 'jane@example.com',
            },
            product_id: 3,
            created_at: '2025-10-14T12:05:00.000Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - only admins can access this resource',
  })
  findAll() {
    return this.favoritesService.findAll();
  }
}
