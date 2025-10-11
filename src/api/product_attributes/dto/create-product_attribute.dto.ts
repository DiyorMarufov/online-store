import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttributeTypes } from 'src/common/enum';

export class CreateProductAttributeDto {
  @ApiProperty({
    example: 'Color',
    description: 'Product attribute name (must be unique)',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: AttributeTypes.TEXT,
    description: 'Type of attribute (for example: TEXT, NUMBER, COLOR, etc.)',
    enum: AttributeTypes,
  })
  @IsEnum(AttributeTypes)
  @IsNotEmpty()
  type: AttributeTypes;
}
