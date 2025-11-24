import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'The ID of the product this variant belongs to',
    example: 3,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    description: 'The price of the product variant',
    example: 299.99,
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The stock quantity available for this variant',
    example: 50,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  stock: number;

  @IsOptional()
  imagea?: string[];
}
