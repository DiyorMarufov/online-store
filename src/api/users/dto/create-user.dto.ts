import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'User phone number (in Uzbekistan format)',
  })
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: 'John@1234',
    description:
      'Strong password with at least 4 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
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
}
