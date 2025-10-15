import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
    description: 'Customer ID who is writing the review',
  })
  @IsInt()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    example: 12,
    description: 'Product ID that is being reviewed',
  })
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    example: 'Excellent product! Works perfectly.',
    description: 'Text comment of the review',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
