import { IsBoolean, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMerchantProductDto {
  @IsInt()
  @IsNotEmpty()
  merchant_id: number;

  @IsInt()
  @IsNotEmpty()
  product_variant_id: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsNotEmpty()
  stock: number;

  @IsBoolean()
  @IsNotEmpty()
  is_active: number;
}
