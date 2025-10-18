import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { PaymentMethods } from 'src/common/enum';

export class CreateOrderDto {
  @ApiProperty({
    example: 5,
    description: 'Address ID where the order will be delivered',
  })
  @IsInt()
  @IsNotEmpty()
  address_id: number;

  @ApiPropertyOptional({
    example: PaymentMethods.CASH,
    enum: PaymentMethods,
    description:
      'Payment method to use. If not provided, defaults to CASH. Possible values: CASH, CARD, CLICK, PAYME, etc.',
  })
  @IsEnum(PaymentMethods)
  @IsOptional()
  payment_method: PaymentMethods = PaymentMethods.CASH;

  @ApiProperty({
    example: [3, 7, 10],
    description: 'Array of cart item IDs included in this order',
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  cart_items_id: number[];
}
