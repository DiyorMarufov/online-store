import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
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
    status: 409,
    description: 'Category with this name already exists',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
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
}
