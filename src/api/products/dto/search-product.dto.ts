import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Search by category ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({
    enum: ['cheap', 'expensive', 'most_rated', 'recent_products'],
  })
  @IsOptional()
  @IsEnum(['cheap', 'expensive', 'most_rated', 'recent_products'])
  sort?: string;

  @ApiPropertyOptional({ description: 'Filter by attribute ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attribute_id?: number;

  @ApiPropertyOptional({ description: 'Filter by attribute value ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attribute_value_id?: number;

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
