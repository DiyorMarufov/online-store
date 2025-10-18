import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new order (Customer only)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Order created successfully',
        data: {
          id: 1,
          customer_id: 5,
          total_price: 250.5,
          status: 'PENDING',
          created_at: '2025-10-18T14:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or payment failed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Payment processing failed',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User, address, or cart items not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cart items not found for user with ID 5',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - only customers can create orders',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiOkResponse({
    description: 'List of all orders returned successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            customer_id: 5,
            total_price: 250.5,
            status: 'PENDING',
            created_at: '2025-10-18T14:00:00.000Z',
          },
          {
            id: 2,
            customer_id: 6,
            total_price: 150.0,
            status: 'DELIVERED',
            created_at: '2025-10-17T16:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
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
    return this.ordersService.findAll();
  }
}
