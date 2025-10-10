import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantsAttributeDto } from './create-product_variants_attribute.dto';

export class UpdateProductVariantsAttributeDto extends PartialType(CreateProductVariantsAttributeDto) {}
