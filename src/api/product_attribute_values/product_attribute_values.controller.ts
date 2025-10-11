import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { CreateProductAttributeValueDto } from './dto/create-product_attribute_value.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Product Attribute Values')
@Controller('product-attribute-values')
export class ProductAttributeValuesController {
  constructor(
    private readonly productAttributeValuesService: ProductAttributeValuesService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product attribute value' })
  @ApiResponse({
    status: 201,
    description: 'Product attribute value created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or duplicate value.',
  })
  create(
    @Body() createProductAttributeValueDto: CreateProductAttributeValueDto,
  ) {
    return this.productAttributeValuesService.create(
      createProductAttributeValueDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all product attribute values' })
  @ApiResponse({
    status: 200,
    description: 'List of product attribute values returned successfully.',
  })
  findAll() {
    return this.productAttributeValuesService.findAll();
  }
}
