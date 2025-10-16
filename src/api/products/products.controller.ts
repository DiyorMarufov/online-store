import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
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

  @Get('by-category/:categoryId')
  @ApiOperation({
    summary: 'Get products by category (includes subcategories)',
  })
  @ApiParam({
    name: 'categoryId',
    type: Number,
    description: 'Category ID (can be parent, child, or sub-child)',
    example: 3,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of products per page',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['cheap', 'expensive', 'most_rated', 'recent_products'],
    description: 'Sort products by different criteria',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Search by product name',
  })
  @ApiQuery({
    name: 'attribute_value',
    required: false,
    type: String,
    description: 'Search by product variant attribute value',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched products by category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findProductsByCategoryId(
    @Param('categoryId') categoryId: number,
    @Query() search?: ProductSearchDto,
  ) {
    return this.productsService.findProductsByCategoryId(categoryId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched product details',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findProductById(id);
  }
}
