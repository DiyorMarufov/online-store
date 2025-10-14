import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

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
            customer_id: 1,
            product_id: 2,
            quantity: 3,
            price: 299.99,
            created_at: '2025-10-14T12:00:00.000Z',
            updated_at: '2025-10-14T12:05:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cart item by ID' })
  @ApiParam({ name: 'id', description: 'Cart item ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cart item found',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          customer_id: 1,
          product_id: 2,
          quantity: 3,
          price: 299.99,
          created_at: '2025-10-14T12:00:00.000Z',
          updated_at: '2025-10-14T12:05:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cart item with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.findOne(id);
  }
}
