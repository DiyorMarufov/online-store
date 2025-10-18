import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER, UsersRoles.MERCHANT)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    schema: {
      example: {
        statusCode: 201,
        message: 'Address created successfully',
        data: {
          id: 1,
          street: '123 Main St',
          city: 'Tashkent',
          postal_code: '100000',
          country: 'Uzbekistan',
          type: 'SHIPPING',
          user_id: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    schema: {
      example: {
        statusCode: 400,
        message: ['street should not be empty', 'city must be a string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.addressesService.create(createAddressDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({
    status: 200,
    description: 'List of addresses',
    schema: {
      example: {
        statusCode: 200,
        message: 'Addresses retrieved successfully',
        data: [
          {
            id: 1,
            street: '123 Main St',
            city: 'Tashkent',
            postal_code: '100000',
            country: 'Uzbekistan',
            type: 'SHIPPING',
            user_id: 5,
          },
          {
            id: 2,
            street: '456 Park Ave',
            city: 'Samarkand',
            postal_code: '140100',
            country: 'Uzbekistan',
            type: 'BILLING',
            user_id: 7,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  findAll() {
    return this.addressesService.findAll();
  }
}
