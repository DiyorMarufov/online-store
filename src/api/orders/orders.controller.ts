import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { OrdersEntity } from 'src/core/entity/orders.entity';

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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('merchants')
  @ApiOperation({ summary: 'Get all orders for merchants' })
  @ApiOkResponse({ description: 'List of orders' })
  @ApiUnauthorizedResponse({ description: 'Token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  findAllForMerchants(@CurrentUser() user: UsersEntity) {
    return this.ordersService.findAllForMerchants(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @Get('merchant-orders')
  @ApiOperation({ summary: 'Get orders for merchant' })
  @ApiOkResponse({
    description: 'List of merchant orders successfully returned',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden: insufficient role permissions',
  })
  findOrdersForMerchant(@CurrentUser() user: UsersEntity) {
    return this.ordersService.findOrdersForMerchant(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('total-orders')
  @ApiOperation({ summary: 'Get total number of orders' })
  @ApiResponse({
    status: 200,
    description: 'Total count of all orders returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Total orders fetched successfully',
        data: { total: 157 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – missing or invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – only SUPERADMIN or ADMIN can access this route.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  totalOrders() {
    return this.ordersService.totalOrders();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('total-orders/merchants')
  @ApiOperation({ summary: 'Get total number of orders for merchants' })
  @ApiOkResponse({
    description: 'Total number of orders returned successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Access denied' })
  totalOrdersForMerchants(@CurrentUser() user: UsersEntity) {
    return this.ordersService.totalOrdersForMerchant(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('merchant-orders/customers')
  @ApiOperation({ summary: 'Get all customers for merchant' })
  @ApiOkResponse({
    description: 'List of customers with their order stats',
  })
  findAllOrdersForCustomer(@CurrentUser() user: UsersEntity) {
    return this.ordersService.findAllOrdersForCustomer(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully retrieved.',
    type: OrdersEntity,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Get('user/orders')
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of orders for the current user.',
    type: [OrdersEntity],
  })
  findAllByCustomerId(@CurrentUser() user: UsersEntity) {
    return this.ordersService.findAllByCustomerId(user);
  }
}
