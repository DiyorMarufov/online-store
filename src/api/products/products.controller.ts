import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Product created successfully',
        data: {
          id: 5,
          category_id: 1,
          name: 'iPhone 15 Pro',
          description: 'The latest Apple smartphone',
          image: 'https://example.com/images/iphone15.jpg',
          is_active: 'ACTIVE',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Product with this name already exists',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'List of all products',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            category_id: 1,
            name: 'iPhone 15 Pro',
            description: 'The latest Apple smartphone',
            image: 'https://example.com/images/iphone15.jpg',
            is_active: 'ACTIVE',
          },
          {
            id: 2,
            category_id: 2,
            name: 'MacBook Air M3',
            description: 'Powerful laptop from Apple',
            image: 'https://example.com/images/macbook.jpg',
            is_active: 'ACTIVE',
          },
        ],
      },
    },
  })
  findAll() {
    return this.productsService.findAll();
  }
}
