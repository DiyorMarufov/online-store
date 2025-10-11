import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductVariantsAttributeDto {
  @ApiProperty({
    example: 3,
    description: 'ID of the product variant (foreign key to product_variants)',
  })
  @IsInt()
  @IsNotEmpty()
  product_variant_id: number;

  @ApiProperty({
    example: 1,
    description:
      'ID of the product attribute (foreign key to product_attributes)',
  })
  @IsInt()
  @IsNotEmpty()
  attribute_id: number;

  @ApiProperty({
    example: 5,
    description:
      'ID of the product attribute value (foreign key to product_attribute_values)',
  })
  @IsInt()
  @IsNotEmpty()
  value_id: number;
}
