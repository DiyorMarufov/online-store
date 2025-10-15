import { Controller, Get, Post, Body } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateAddressDto })
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({
    status: 200,
    description: 'List of addresses',
  })
  findAll() {
    return this.addressesService.findAll();
  }
}
