import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UsersRoles } from 'src/common/enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UsersEntity } from 'src/core/entity/users.entity';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.CUSTOMER, UsersRoles.MERCHANT)
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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Address retrieved successfully',
        data: {
          id: 1,
          street: '123 Main St',
          city: 'Tashkent',
          postal_code: '100000',
          country: 'Uzbekistan',
          type: 'SHIPPING',
          user: {
            id: 5,
            full_name: 'John Doe',
            email: 'john@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Address with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.addressesService.findOne(id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('admin/customers/:id')
  @ApiOperation({ summary: 'Get customer addresses' })
  @ApiParam({ name: 'id', type: Number, description: 'Customer ID' })
  @ApiOkResponse({
    description: 'Customer address list',
  })
  findCustomerAddressesById(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findCustomerAddressesById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update address by ID' })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Address updated successfully',
        data: {
          id: 1,
          street: '456 New St',
          city: 'Tashkent',
          postal_code: '100001',
          country: 'Uzbekistan',
          type: 'BILLING',
          user_id: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  update(
    @Body() updateAddressDto: UpdateAddressDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.addressesService.update(updateAddressDto, id, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN, UsersRoles.CUSTOMER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Address deleted successfully',
        data: {
          id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsersEntity,
  ) {
    return this.addressesService.delete(id, user);
  }
}
