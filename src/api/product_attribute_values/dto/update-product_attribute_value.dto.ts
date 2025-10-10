import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAttributeValueDto } from './create-product_attribute_value.dto';

export class UpdateProductAttributeValueDto extends PartialType(CreateProductAttributeValueDto) {}
