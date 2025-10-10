import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAttributeDto } from './create-product_attribute.dto';

export class UpdateProductAttributeDto extends PartialType(CreateProductAttributeDto) {}
