import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product_variants.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Product Variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Create a new product variant (Admin or Superadmin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product variant created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Product variant created successfully',
        data: {
          id: 1,
          product_id: 3,
          price: 299.99,
          stock: 50,
          image: 'https://example.com/variant1.png',
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
        message: 'product_id should not be empty',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only Admin or Superadmin can create',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden user with role USER',
      },
    },
  })
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product variants (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all product variants',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            product_id: 3,
            price: 299.99,
            stock: 50,
            image: 'https://example.com/variant1.png',
          },
          {
            id: 2,
            product_id: 3,
            price: 349.99,
            stock: 20,
            image: 'https://example.com/variant2.png',
          },
        ],
      },
    },
  })
  findAll() {
    return this.productVariantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product variant by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product variant ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved product variant with its attributes and values',
    schema: {
      example: {
        statusCode: 200,
        message: 'success',
        data: {
          id: 1,
          created_at: '2025-10-11T16:18:24.607Z',
          updated_at: '2025-10-11T16:18:24.607Z',
          product: {
            id: 1,
            name: 'iPhone 15 Pro',
            description: 'The latest Apple smartphone with A17 Pro chip',
            image: 'https://example.com/images/iphone15.jpg',
            is_active: 'active',
          },
          product_attributes: [
            {
              id: 1,
              name: 'Color',
              type: 'text',
              created_at: '2025-10-11T14:39:07.547Z',
              updated_at: '2025-10-11T14:39:07.547Z',
            },
            {
              id: 2,
              name: 'Storage',
              type: 'number',
              created_at: '2025-10-11T14:40:00.000Z',
              updated_at: '2025-10-11T14:40:00.000Z',
            },
          ],
          product_values: [
            {
              id: 1,
              value: 'Red',
              created_at: '2025-10-11T14:52:10.000Z',
              updated_at: '2025-10-11T14:52:10.000Z',
            },
            {
              id: 2,
              value: '256 GB',
              created_at: '2025-10-11T14:53:00.000Z',
              updated_at: '2025-10-11T14:53:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  findOne(@Param('id') id: number) {
    return this.productVariantsService.findOne(id);
  }
}
