import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { ProductSearchDto } from './dto/search-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Get all products (with optional search filters)' })
  @ApiResponse({ status: 200, description: 'List of all products' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query() search?: ProductSearchDto) {
    return this.productsService.findAll(search);
  }
}
