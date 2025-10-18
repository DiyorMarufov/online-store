import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Cart Items')
@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product variant to the cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiCreatedResponse({
    description: 'The product variant has been added to the cart',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: 1,
          cart_id: 1,
          product_variant_id: 2,
          quantity: 3,
          created_at: '2025-10-14T12:00:00.000Z',
          updated_at: '2025-10-14T12:05:00.000Z',
        },
      },
    },
  })
  create(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartItemsService.create(createCartItemDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all cart items (Superadmin AND Admin only)' })
  @ApiOkResponse({
    description: 'List of all cart items',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            cart_id: 1,
            product_variant_id: 2,
            quantity: 3,
            created_at: '2025-10-14T12:00:00.000Z',
            updated_at: '2025-10-14T12:05:00.000Z',
          },
          {
            id: 2,
            cart_id: 1,
            product_variant_id: 3,
            quantity: 1,
            created_at: '2025-10-14T12:10:00.000Z',
            updated_at: '2025-10-14T12:12:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.cartItemsService.findAll();
  }
}
