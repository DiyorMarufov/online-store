import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMerchantProductDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the merchant (seller)',
  })
  @IsInt()
  @IsNotEmpty()
  merchant_id: number;

  @ApiProperty({
    example: 5,
    description: 'ID of the product variant being sold',
  })
  @IsInt()
  @IsNotEmpty()
  product_variant_id: number;

  @ApiProperty({
    example: 250000.0,
    description: 'Product price (in currency)',
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 100,
    description: 'Number of items available in stock',
  })
  @IsInt()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    example: true,
    description: 'Whether the product is active (true) or inactive (false)',
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
