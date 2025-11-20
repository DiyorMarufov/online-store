import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from 'src/common/enum';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the category the product belongs to',
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  category_id: number;

  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'The latest Apple smartphone with A17 Pro chip',
    description: 'Detailed description of the product',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    enum: Status,
    example: Status.ACTIVE,
    description: 'Status of the product (ACTIVE or INACTIVE)',
  })
  @IsEnum(Status)
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  is_active?: Status = Status.ACTIVE;

  @IsOptional()
  image?: string;
}
