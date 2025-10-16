import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSearchDto {
  @ApiPropertyOptional({ description: 'Search by product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search by product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Search by category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: [
      // 'popular',
      'cheap',
      'expensive',
      'most_rated',
      // 'most_orders',
      'recent_orders',
    ],
  })
  @IsOptional()
  @IsEnum([
    // 'popular',
    'cheap',
    'expensive',
    'most_rated',
    // 'most_orders',
    'recent_orders',
  ])
  sort?: string;

  @ApiPropertyOptional({ description: 'Filter by attribute ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attribute_id?: number;

  @ApiPropertyOptional({ description: 'Filter by attribute value' })
  @IsOptional()
  @IsString()
  attribute_value?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
