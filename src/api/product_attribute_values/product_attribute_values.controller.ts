import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductAttributeValuesService } from './product_attribute_values.service';
import { CreateProductAttributeValueDto } from './dto/create-product_attribute_value.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UpdateProductAttributeValueDto } from './dto/update-product_attribute_value.dto';

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

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update product attribute value by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product attribute value ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product attribute value successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Product attribute value not found',
  })
  @Patch(':id')
  update(
    @Body() updateProductAttributeValueDto: UpdateProductAttributeValueDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productAttributeValuesService.update(
      updateProductAttributeValueDto,
      id,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete product attribute value by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product attribute value ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product attribute value successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Product attribute value not found',
  })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributeValuesService.delete(id);
  }
}
