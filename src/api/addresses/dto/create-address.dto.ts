import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

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
