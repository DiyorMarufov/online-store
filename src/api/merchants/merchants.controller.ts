import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Merchants') // Swagger'da guruh nomi
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({
    status: 201,
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
  @ApiResponse({
    status: 409,
    description: 'Merchant with the given user_id already exists',
  })
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.create(createMerchantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchants' })
  @ApiResponse({ status: 200, description: 'List of all merchants' })
  findAll() {
    return this.merchantsService.findAll();
  }
}
