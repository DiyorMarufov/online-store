import { Controller, Get, Post, Body } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a product variant to the cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({
    status: 201,
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

  @Get()
  @ApiOperation({ summary: 'Get all cart items' })
  @ApiResponse({
    status: 200,
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
