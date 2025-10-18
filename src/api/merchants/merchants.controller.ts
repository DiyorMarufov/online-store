import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Create a new merchant (Admin, SuperAdmin, Merchant)',
  })
  @ApiBody({ type: CreateMerchantDto })
  @ApiCreatedResponse({
    description: 'Merchant successfully created',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Merchant created successfully',
        data: {
          id: 1,
          user_id: 5,
          store_name: 'TechZone',
          store_logo: 'uploads/logo.png',
          store_description: 'Electronics and gadgets store',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Merchant with the given user_id already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Merchant with user_id 5 already exists',
        error: 'Conflict',
      },
    },
  })
  create(
    @Body() createMerchantDto: CreateMerchantDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantsService.create(createMerchantDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchants' })
  @ApiOkResponse({
    description: 'List of all merchants',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            user_id: 5,
            store_name: 'TechZone',
            store_logo: 'uploads/logo.png',
            store_description: 'Electronics and gadgets store',
          },
          {
            id: 2,
            user_id: 6,
            store_name: 'BookWorld',
            store_logo: 'uploads/logo2.png',
            store_description: 'Books and stationery store',
          },
        ],
      },
    },
  })
  findAll() {
    return this.merchantsService.findAll();
  }
}
