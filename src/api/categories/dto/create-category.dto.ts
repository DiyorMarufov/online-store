import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '5e6f8a1b-2f40-4e22-8e7f-4e6bcb0b55e2',
    description: 'Ota kategoriya ID (agar subcategory bo‘lsa)',
  })
  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
