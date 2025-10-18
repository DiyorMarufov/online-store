import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all payments returned successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            order_id: 10,
            amount: 250.5,
            status: 'COMPLETED',
            created_at: '2025-10-18T14:00:00.000Z',
          },
          {
            id: 2,
            order_id: 11,
            amount: 100.0,
            status: 'PENDING',
            created_at: '2025-10-18T15:00:00.000Z',
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
    return this.paymentsService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID (Admin & Customer)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Payment found successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          order_id: 10,
          amount: 250.5,
          status: 'COMPLETED',
          created_at: '2025-10-18T14:00:00.000Z',
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
    description: 'Forbidden - you cannot access this payment',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Payment with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.paymentsService.findOne(id, user);
  }
}
