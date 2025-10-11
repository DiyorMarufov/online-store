import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductVariantsAttributesService } from './product_variants_attributes.service';
import { CreateProductVariantsAttributeDto } from './dto/create-product_variants_attribute.dto';
import { checkRoles } from 'src/common/decorator/role.decorator';
import { UsersRoles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';

@ApiTags('Product Variants Attributes')
@Controller('product-variants-attributes')
export class ProductVariantsAttributesController {
  constructor(
    private readonly productVariantsAttributesService: ProductVariantsAttributesService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @checkRoles(UsersRoles.SUPERADMIN, UsersRoles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Create a new product variant attribute' })
  @ApiResponse({
    status: 201,
    description: 'Product variant attribute created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or duplicate entry.',
  })
  create(
    @Body()
    createProductVariantsAttributeDto: CreateProductVariantsAttributeDto,
  ) {
    return this.productVariantsAttributesService.create(
      createProductVariantsAttributeDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all product variant attributes' })
  @ApiResponse({
    status: 200,
    description: 'List of all product variant attributes.',
  })
  findAll() {
    return this.productVariantsAttributesService.findAll();
  }
}
