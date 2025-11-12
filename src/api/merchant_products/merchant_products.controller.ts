import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MerchantProductsService } from './merchant_products.service';
import { CreateMerchantProductDto } from './dto/create-merchant_product.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UpdateMerchantProductDto } from './dto/update-merchant_product.dto';

@ApiTags('Merchant Products')
@Controller('merchant-products')
export class MerchantProductsController {
  constructor(
    private readonly merchantProductsService: MerchantProductsService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product variant (Merchant only)' })
  @ApiBody({ type: CreateMerchantProductDto })
  @ApiCreatedResponse({
    description: 'Merchant product successfully created.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: 1,
          merchant_id: 5,
          product_id: 12,
          price: 150.0,
          stock: 20,
          created_at: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (only merchants are allowed).',
    schema: {
      example: {
        statusCode: 403,
        message: 'Role is not merchant',
        error: 'Forbidden',
      },
    },
  })
  create(
    @Body() createMerchantProductDto: CreateMerchantProductDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantProductsService.create(createMerchantProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all merchant products' })
  @ApiOkResponse({
    description: 'List of all merchant products.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            merchant_id: 5,
            product_id: 12,
            price: 150.0,
            stock: 20,
            created_at: '2025-10-18T12:00:00.000Z',
          },
          {
            id: 2,
            merchant_id: 6,
            product_id: 15,
            price: 200.0,
            stock: 10,
            created_at: '2025-10-18T12:10:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.merchantProductsService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('total-products')
  @ApiOperation({ summary: 'Get total number of products for the merchant' })
  @ApiOkResponse({
    description: 'Total number of products returned successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  totalMerchantProducts(@CurrentUser() user: UsersEntity) {
    return this.merchantProductsService.totalMerchantProducts(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get merchant product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant product ID' })
  @ApiOkResponse({ description: 'Merchant product found successfully' })
  @ApiNotFoundResponse({ description: 'Merchant product not found' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantProductsService.findOne(id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update merchant product' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant product ID' })
  @ApiOkResponse({ description: 'Merchant product updated successfully' })
  @ApiNotFoundResponse({ description: 'Merchant product not found' })
  @Patch(':id')
  update(
    @Body() updateMerchantProductDto: UpdateMerchantProductDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantProductsService.update(
      updateMerchantProductDto,
      id,
      user,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete merchant product' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant product ID' })
  @ApiOkResponse({ description: 'Merchant product deleted successfully' })
  @ApiNotFoundResponse({ description: 'Merchant product not found' })
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantProductsService.delete(id, user);
  }
}
