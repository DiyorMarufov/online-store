import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductAttributesService } from './product_attributes.service';
import { CreateProductAttributeDto } from './dto/create-product_attribute.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth-guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UpdateProductAttributeDto } from './dto/update-product_attribute.dto';

@ApiTags('Product Attributes')
@Controller('product-attributes')
export class ProductAttributesController {
  constructor(
    private readonly productAttributesService: ProductAttributesService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product attribute' })
  @ApiResponse({
    status: 201,
    description: 'Product attribute created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or duplicate attribute name.',
  })
  create(@Body() createProductAttributeDto: CreateProductAttributeDto) {
    return this.productAttributesService.create(createProductAttributeDto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('admin')
  @ApiOperation({ summary: 'Get all product attributes' })
  @ApiResponse({
    status: 200,
    description: 'List of product attributes retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden – insufficient permissions.',
  })
  findAll() {
    return this.productAttributesService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update product attribute' })
  @ApiResponse({
    status: 200,
    description: 'Product attribute updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product attribute not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN or SUPERADMIN can update.',
  })
  @Patch(':id')
  update(
    @Body() updateProductAttributeDto: UpdateProductAttributeDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productAttributesService.update(updateProductAttributeDto, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete product attribute' })
  @ApiResponse({
    status: 200,
    description: 'Product attribute deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product attribute not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only ADMIN or SUPERADMIN can delete.',
  })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productAttributesService.delete(id);
  }
}
