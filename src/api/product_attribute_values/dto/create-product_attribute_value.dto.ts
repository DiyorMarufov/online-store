import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductAttributeValueDto {
  @ApiProperty({
    example: 1,
    description:
      'ID of the product attribute (foreign key to product_attributes)',
  })
  @IsInt()
  @IsNotEmpty()
  attribute_id: number;

  @ApiProperty({
    example: 'Red',
    description: 'Value of the product attribute (e.g., color, size, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}
