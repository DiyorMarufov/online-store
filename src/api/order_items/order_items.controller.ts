import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrderItemsService } from './order_items.service';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';

@ApiTags('Order Items')
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all order items' })
  @ApiResponse({
    status: 200,
    description: 'List of all order items',
    type: [OrderItemsEntity],
  })
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order item by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Order item ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns one order item',
    type: OrderItemsEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.findOne(id);
  }
}
