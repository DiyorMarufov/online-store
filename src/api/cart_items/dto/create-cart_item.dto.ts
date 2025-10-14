import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'ID of the cart',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  cart_id: number;

  @ApiProperty({
    description: 'ID of the product variant to add',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  product_variant_id: number;

  @ApiProperty({
    description: 'Quantity of the product variant to add',
    example: 3,
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
