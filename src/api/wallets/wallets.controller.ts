import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new wallet (CUSTOMER & MERCHANT only)' })
  @ApiBody({ type: CreateWalletDto })
  @ApiCreatedResponse({
    description: 'Wallet created successfully',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Wallet created successfully',
        data: {
          id: 1,
          user_id: 5,
          balance: 0.0,
          currency: 'USD',
          created_at: '2025-10-18T15:00:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized — missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden — user role not allowed',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  create(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.walletsService.create(createWalletDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all wallets (ADMIN & SUPERADMIN only)' })
  @ApiOkResponse({
    description: 'List of all wallets',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            user_id: 5,
            balance: 120.5,
            currency: 'USD',
            created_at: '2025-10-18T15:00:00.000Z',
          },
          {
            id: 2,
            user_id: 6,
            balance: 50.0,
            currency: 'EUR',
            created_at: '2025-10-18T16:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized — missing or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden — user role not allowed',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  findAll() {
    return this.walletsService.findAll();
  }
}
