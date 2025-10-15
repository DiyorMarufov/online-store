import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Filter popular products (true/false)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  popular?: boolean;

  @ApiPropertyOptional({ description: 'Filter cheapest products (true/false)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  cheap?: boolean;

  @ApiPropertyOptional({
    description: 'Filter expensive products (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  expensive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter most rated products (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  most_rated?: boolean;

  @ApiPropertyOptional({
    description: 'Filter products with most orders (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  most_orders?: boolean;

  @ApiPropertyOptional({
    description: 'Filter products with recent orders (true/false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  recent_orders?: boolean;

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
