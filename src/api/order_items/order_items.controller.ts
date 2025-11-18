import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderItemsService } from './order_items.service';
import { OrderItemsEntity } from 'src/core/entity/order_items.entity';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Order Items')
@ApiBearerAuth('access-token')
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all order items (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all order items',
    type: [OrderItemsEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admins can access this resource',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  findAll() {
    return this.orderItemsService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER)
  @Get(':id')
  @ApiOperation({ summary: 'Get one order item by ID (customer only)' })
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
    status: 401,
    description: 'Unauthorized - missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - customer can only access their own order items',
    schema: {
      example: {
        statusCode: 403,
        message: "You don't have access to this order item",
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Order item with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.orderItemsService.findOne(id, user);
  }
}
