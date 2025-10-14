import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({
    description: 'ID of the customer',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    description: 'ID of the product to be favorited',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  product_id: number;
}
