import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Patch,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product_variants.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/infrastructure/pipe/image.validation';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';

@ApiTags('Product Variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @UseInterceptors(FilesInterceptor('images'))
  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Create a new product variant (Admin or Superadmin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Data for creating product variant, including multiple images',
    schema: {
      type: 'object',
      properties: {
        product_id: { type: 'number', example: 3 },
        price: { type: 'number', example: 299.99 },
        stock: { type: 'number', example: 50 },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
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
          images: [
            'https://example.com/variant1.png',
            'https://example.com/variant2.png',
          ],
        },
      },
    },
  })
  create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @UploadedFiles(new ImageValidationPipe()) images?: Express.Multer.File[],
  ) {
    return this.productVariantsService.create(createProductVariantDto, images);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all product variants' })
  @ApiResponse({
    status: 200,
    description: 'List of all product variants successfully retrieved',
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
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'No product variants found' })
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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Update product variant by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product variant ID' })
  @ApiResponse({
    status: 200,
    description: 'Product variant successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productVariantsService.update(updateProductVariantDto, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product variant by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product variant ID' })
  @ApiResponse({
    status: 200,
    description: 'Product variant successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productVariantsService.delete(id);
  }
}
