import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'The ID of the product this variant belongs to',
    example: 3,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    description: 'The price of the product variant',
    example: 299.99,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The stock quantity available for this variant',
    example: 50,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    description: 'Optional image URL for this product variant',
    example: 'https://example.com/variant1.png',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  image?: string;
}
