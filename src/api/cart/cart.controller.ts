import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all carts (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all carts',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            customer: {
              id: 1,
              full_name: 'John Doe',
              email: 'john@example.com',
            },
            cart_items: [
              {
                id: 10,
                product_id: 2,
                quantity: 3,
                price: 299.99,
              },
            ],
            created_at: '2025-10-14T12:00:00.000Z',
            updated_at: '2025-10-14T12:05:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admins can access this resource',
  })
  findAll() {
    return this.cartService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get a cart by ID (superadmin and admin)' })
  @ApiParam({ name: 'id', description: 'Cart ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          customer: {
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
          },
          cart_items: [
            {
              id: 10,
              product_id: 2,
              quantity: 3,
              price: 299.99,
            },
          ],
          created_at: '2025-10-14T12:00:00.000Z',
          updated_at: '2025-10-14T12:05:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - trying to access another user’s cart',
    schema: {
      example: {
        statusCode: 403,
        message: "You can't access to other's cart",
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Cart with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.cartService.findOne(id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('admin/customers/:id')
  @ApiOperation({ summary: 'Get customer cart' })
  @ApiParam({ name: 'id', type: Number, description: 'Customer ID' })
  @ApiOkResponse({
    description: 'Customer cart details',
  })
  findCustomerCartById(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.findCustomerCartById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @ApiTags('Cart')
  @ApiOperation({ summary: 'Foydalanuvchining cart maʼlumotlarini olish' })
  @ApiResponse({
    status: 200,
    description:
      'Foydalanuvchining cart maʼlumotlari muvaffaqiyatli qaytarildi.',
    schema: {
      example: {
        id: 'a1b2c3d4',
        userId: 'u123',
        items: [
          { productId: 'p456', quantity: 2 },
          { productId: 'p789', quantity: 1 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Avtorizatsiya talab qilinadi yoki token yaroqsiz.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Ruxsat etilmagan rol (faqat SUPERADMIN, ADMIN, CUSTOMER uchun).',
  })
  @ApiResponse({
    status: 404,
    description: 'Foydalanuvchiga tegishli cart topilmadi.',
  })
  @Get('user/cart')
  findOneByCustomerId(@CurrentUser() user: UsersEntity) {
    return this.cartService.findOneByCustomerId(user);
  }
}
