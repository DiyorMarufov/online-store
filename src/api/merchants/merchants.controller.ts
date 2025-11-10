import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
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
  ApiConsumes,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/infrastructure/pipe/image.validation';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Create a new merchant (Admin, SuperAdmin, Merchant)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        store_name: { type: 'string', example: 'TechZone' },
        store_description: {
          type: 'string',
          example: 'Electronics and gadgets store',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Merchant successfully created',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Merchant created successfully',
        data: {
          id: 1,
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
    @UploadedFile(new ImageValidationPipe()) image?: Express.Multer.File,
  ) {
    return this.merchantsService.create(createMerchantDto, user, image);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all merchants (Admin, SuperAdmin)' })
  @ApiOkResponse({
    description: 'List of all merchants',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            user: {
              id: 5,
              full_name: 'John Doe',
              email: 'john@example.com',
            },
            store_name: 'TechZone',
            store_logo: 'uploads/logo.png',
            store_description: 'Electronics and gadgets store',
          },
          {
            id: 2,
            user: {
              id: 6,
              full_name: 'Jane Smith',
              email: 'jane@example.com',
            },
            store_name: 'BookWorld',
            store_logo: 'uploads/logo2.png',
            store_description: 'Books and stationery store',
          },
        ],
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - not allowed to access merchants list',
    schema: {
      example: {
        statusCode: 403,
        message:
          'Access denied: only Admins, SuperAdmins can view merchants list',
        error: 'Forbidden',
      },
    },
  })
  findAll() {
    return this.merchantsService.findAll();
  }

  @ApiOperation({ summary: 'Get total number of merchant stores' })
  @ApiResponse({
    status: 200,
    description: 'Total count of all merchant stores returned successfully.',
    schema: {
      example: {
        success: true,
        message: 'Total merchant stores fetched successfully',
        data: { total: 42 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – missing or invalid token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden – only SUPERADMIN, ADMIN, or MERCHANT can access this route.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('total-stores')
  totalMerchantStores() {
    return this.merchantsService.totalMerchantStores();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Get('stores')
  @ApiOperation({ summary: 'Get all stores by merchant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of merchant stores successfully retrieved',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Merchant stores not found' })
  findAllByMerchantId(@CurrentUser() user: UsersEntity) {
    return this.merchantsService.findAllByMerchantId(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get merchant by ID (Admin, SuperAdmin, Merchant)' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant ID' })
  @ApiOkResponse({
    description: 'Merchant found successfully',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          store_name: 'TechZone',
          store_description: 'Electronics and gadgets store',
          user: {
            id: 5,
            full_name: 'John Doe',
            email: 'john@example.com',
          },
          merchant_products: [
            {
              id: 10,
              product_name: 'Laptop',
              price: 1200,
            },
          ],
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Merchant not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Merchant with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - not allowed to access this merchant',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied: you can only access your own merchant account',
        error: 'Forbidden',
      },
    },
  })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantsService.findOne(id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Update merchant by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant successfully updated' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Body() updateMerchantDto: UpdateMerchantDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantsService.update(updateMerchantDto, id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete merchant by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant successfully deleted' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.merchantsService.delete(id, user);
  }
}
