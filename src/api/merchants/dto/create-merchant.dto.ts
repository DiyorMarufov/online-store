import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ example: 'TechZone', description: 'Store name' })
  @IsString()
  @IsNotEmpty()
  store_name: string;

  @ApiProperty({
    example: 'Electronics and gadgets store',
    description: 'Store description',
  })
  @IsString()
  @IsNotEmpty()
  store_description: string;

  @IsOptional()
  image?: string;
}
