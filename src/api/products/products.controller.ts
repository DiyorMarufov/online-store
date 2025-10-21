import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Patch,
  Delete,
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
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { Status, UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { ProductSearchDto } from './dto/search-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/infrastructure/pipe/image.validation';
import { ProductSearchByCategoryDto } from './dto/search-product-bycategorty.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'iPhone 15 Pro' },
        description: { type: 'string', example: 'The latest Apple smartphone' },
        image: {
          type: 'string',
          format: 'binary',
        },
        is_active: { type: 'enum', example: Status.ACTIVE },
      },
      required: ['category_id', 'name', 'description'],
    },
  })
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
          is_active: Status.ACTIVE,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Product with this name already exists',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(new ImageValidationPipe()) image?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (with optional search filters)' })
  @ApiResponse({ status: 200, description: 'List of all products' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'description', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiQuery({
    name: 'attribute_value_id',
    required: false,
    description: 'Filter by attribute value ID',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['cheap', 'expensive', 'most_rated', 'recent_products'],
  })
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
    name: 'attribute_value_id',
    required: false,
    type: Number,
    description: 'Filter by attribute value ID (e.g., color, size)',
  })
  @ApiQuery({
    name: 'attribute_id',
    required: false,
    type: Number,
    description: 'Filter by attribute ID (e.g., color or size attribute)',
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
    @Query() search?: ProductSearchByCategoryDto,
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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully updated.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only Admins and Superadmins.',
  })
  @Patch(':id')
  update(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.update(updateProductDto, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only Admins and Superadmins.',
  })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
