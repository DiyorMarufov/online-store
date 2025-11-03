import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Status } from 'src/common/enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John@1234',
    description:
      'Strong password with at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @IsStrongPassword({
    minLength: 4,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'User verification status',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({
    description: 'User account status',
    enum: Status,
    example: Status.ACTIVE,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}
