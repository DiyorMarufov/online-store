import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ProductSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  category?: string;
}
