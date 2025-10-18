import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UsersRoles } from 'src/common/enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new category (Only Superadmin or Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Category created successfully',
        data: {
          id: 1,
          name: 'Electronics',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'name should not be empty',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token is missing or invalid',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only Superadmin or Admin can access this endpoint',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden user with role USER',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Category with this name already exists',
    schema: {
      example: {
        success: false,
        statusCode: 409,
        message: 'Category with this name already exists',
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of all categories',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Clothing' },
          { id: 3, name: 'Books' },
        ],
      },
    },
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the category to delete',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Category deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Category with given ID not found',
        error: 'Not Found',
      },
    },
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
