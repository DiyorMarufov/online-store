import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
  ApiResponse,
} from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Create a new product variant for the merchant' })
  @ApiResponse({
    status: 201,
    description: 'Merchant product successfully created.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (only merchants are allowed).',
  })
  create(@Body() createMerchantProductDto: CreateMerchantProductDto) {
    return this.merchantProductsService.create(createMerchantProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all merchant products' })
  @ApiResponse({ status: 200, description: 'List of all merchant products.' })
  findAll() {
    return this.merchantProductsService.findAll();
  }
}
