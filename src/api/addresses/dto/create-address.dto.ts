import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Tashkent', description: 'Region name' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'Chilonzor', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'Makhtumkuli street 12',
    description: 'Street address',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is this the default address?',
  })
  @IsBoolean()
  @IsOptional()
  is_default: boolean;
}
