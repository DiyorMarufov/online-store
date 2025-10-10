import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ example: 5, description: 'User ID of the merchant' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: 'TechZone', description: 'Store name' })
  @IsString()
  @IsNotEmpty()
  store_name: string;

  @ApiProperty({
    example: 'uploads/logo.png',
    description: 'Store logo image path',
  })
  @IsString()
  @IsNotEmpty()
  store_logo: string;

  @ApiProperty({
    example: 'Electronics and gadgets store',
    description: 'Store description',
  })
  @IsString()
  @IsNotEmpty()
  store_description: string;
}
