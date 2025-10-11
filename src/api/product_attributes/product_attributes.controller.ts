import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Product Attributes') // Swagger bo‘lim nomi
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

  @Get()
  @ApiOperation({ summary: 'Get all product attributes' })
  @ApiResponse({
    status: 200,
    description: 'List of product attributes returned successfully.',
  })
  findAll() {
    return this.productAttributesService.findAll();
  }
}
